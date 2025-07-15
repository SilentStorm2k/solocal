'use server';

import { db } from '@/drizzle/db';
import { ScheduleAvailabilityTable, ScheduleTable } from '@/drizzle/schema';
import { scheduleFormSchema } from '@/schema/schedule';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { BatchItem } from 'drizzle-orm/batch';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { getCalendarEventTimes } from '../google/googleCalendar';
import {
  addMinutes,
  areIntervalsOverlapping,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  isWithinInterval,
  setHours,
  setMinutes,
} from 'date-fns';
import { DAYS_OF_WEEK_IN_ORDER } from '@/constants';
import { fromZonedTime } from 'date-fns-tz';

type ScheduleRow = typeof ScheduleTable.$inferSelect;
type AvailabilityRow = typeof ScheduleAvailabilityTable.$inferSelect;

export type FullSchedule = ScheduleRow & { availabilities: AvailabilityRow[] };

export async function getSchedule(userId: string): Promise<FullSchedule> {
  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: {
      availabilities: true, // Include all availabilities for this schedule
    },
  });

  return schedule as FullSchedule;
}

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>,
) {
  try {
    const { userId } = await auth();

    const { success, data } = scheduleFormSchema.safeParse(unsafeData);

    if (!userId || !success)
      throw new Error('Invalid schedule data or User not authenticated');

    const { availabilities, ...scheduleData } = data;

    // Upsert the schedule
    const [{ id: scheduleId }] = await db
      .insert(ScheduleTable)
      .values({
        ...scheduleData,
        clerkUserId: userId,
      })
      .onConflictDoUpdate({
        target: ScheduleTable.clerkUserId,
        set: scheduleData,
      })
      .returning({ id: ScheduleTable.id });

    const statements: [BatchItem<'pg'>] = [
      // Delete existing availabilities for this schedule
      db
        .delete(ScheduleAvailabilityTable)
        .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId)),
    ];

    // insert new availabilities
    if (availabilities.length > 0) {
      statements.push(
        db.insert(ScheduleAvailabilityTable).values(
          availabilities.map((availability) => ({
            ...availability,
            scheduleId,
          })),
        ),
      );
    }

    await db.batch(statements);
  } catch (error: any) {
    throw new Error(`Failed to save schedule: ${error.message || error}`);
  } finally {
    // Revalidate the schedule page to show the updated schedule
    revalidatePath('/schedule');
  }
}

// This function will need to provide time slots for a given event that:
// 1. Match the user's available schedule
// 2. Do not overlap with existing Google Calendar events
//  also accounting for the total time the event may take
export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number },
): Promise<Date[]> {
  const { clerkUserId: userId, durationInMinutes } = event;

  const start = timesInOrder[0];
  const end = timesInOrder.at(-1);

  console.log('Start and end: ', start, end, timesInOrder);
  if (!start || !end) return [];

  const schedule = await getSchedule(userId); // get users schedule with the availabilities

  console.log(schedule);
  if (schedule == null) return [];

  const groupedAvailabilities = Object.groupBy(
    schedule.availabilities,
    (a) => a.dayOfWeek,
  );

  // using GoogleAPI
  // fetch all existing events in user's google calender events between start and end
  const existingEventTimes = await getCalendarEventTimes(userId, {
    start,
    end,
  });
  // const existingEventTimes: { start: Date; end: Date }[] = [];
  // Filter and return time slots based on availability and ones that are devoid of time conflicts with existing events in calendar
  return timesInOrder.filter((intervalDate) => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule.timezone,
    );

    // proposed event with potential start and end times
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, durationInMinutes),
    };

    // keep only the time slots which adhere to the 2 conditions:
    // 1. Do not overlap with any other existing Google Calendar events
    // 2. Match the user's available schedule
    //  also accounting for the total time the event may take

    return (
      existingEventTimes.every((eventTime) => {
        return !areIntervalsOverlapping(eventTime, eventInterval);
      }) &&
      availabilities.some((availability) => {
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        );
      })
    );
  });
}

function getAvailabilities(
  groupedAvailabilities: Partial<
    Record<
      (typeof DAYS_OF_WEEK_IN_ORDER)[number],
      (typeof ScheduleAvailabilityTable.$inferSelect)[]
    >
  >,
  date: Date,
  timezone: string,
): { start: Date; end: Date }[] {
  const dayOfWeek = (() => {
    if (isMonday(date)) return 'monday';
    if (isTuesday(date)) return 'tuesday';
    if (isWednesday(date)) return 'wednesday';
    if (isThursday(date)) return 'thursday';
    if (isFriday(date)) return 'friday';
    if (isSaturday(date)) return 'saturday';
    if (isSunday(date)) return 'sunday';
    return null;
  })();

  if (!dayOfWeek) return [];

  const dayAvailabilities = groupedAvailabilities[dayOfWeek];

  if (!dayAvailabilities) return [];

  return dayAvailabilities.map(({ startTime, endTime }) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = fromZonedTime(
      setMinutes(setHours(date, startHour), startMinute),
      timezone,
    );
    const end = fromZonedTime(
      setMinutes(setHours(date, endHour), endMinute),
      timezone,
    );

    return { start, end };
  });
}
