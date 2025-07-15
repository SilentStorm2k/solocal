import { getEvent } from '@/server/actions/events';
import { AlertTriangle } from 'lucide-react';
import {
  roundToNearestMinutes,
  endOfDay,
  addYears,
  eachMinuteOfInterval,
} from 'date-fns';
import { getValidTimesFromSchedule } from '@/server/actions/schedule';
import NoTimeSlots from '@/components/NoTimeSlots';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { clerkClient } from '@clerk/nextjs/server';
import MeetingForm from '@/components/forms/MeetingForm';

export default async function BookEventPage({
  params,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
}) {
  const { clerkUserId, eventId } = await params;

  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);

  const event = await getEvent(clerkUserId, eventId);

  if (!event)
    return (
      <div className='bg-red-500 border border-red-200 text-red-800 px-4 rounded-md flex items-center justify-center gap-2 text-sm max-w-md mx-auto mt-6'>
        <AlertTriangle className='w-5 h-5' />
        <span>This event doesn't exist anymore.</span>
      </div>
    );

  // Define a date range from now (to a year later)
  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: 'ceil',
  });

  const endDate = endOfDay(addYears(startDate, 1));

  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
    event,
  );

  if (validTimes.length === 0)
    return <NoTimeSlots event={event} calendarUser={calendarUser} />;

  // Actual booking form with list of valid available times
  return (
    <Card className='max-w-4xl mx-auto border-8 border-solocal-neutral-off-white/65 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <MeetingForm
          validTimes={validTimes}
          eventId={eventId}
          clerkUserId={clerkUserId}
        />
      </CardContent>
    </Card>
  );
}
