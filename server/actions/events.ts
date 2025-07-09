'use server';

import { db } from '@/drizzle/db';
import { EventTable } from '@/drizzle/schema';
import { eventFormSchema } from '@/schema/events';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export async function createEvent(
  unsafeData: z.infer<typeof eventFormSchema>,
): Promise<void> {
  try {
    // Authenticate the user with Clerk
    const { userId } = await auth();
    // Trying to validate the data against the schema
    const { success, data } = eventFormSchema.safeParse(unsafeData);
    if (!success || !userId)
      throw new Error('Invalid data or user not authenticated');

    // If validation is successful, proceed with event creation and put the to database
    await db.insert(EventTable).values({ ...data, clerkUserId: userId });
  } catch (error: any) {
    throw new Error(`Failed to create event: ${error.message || error}`);
  } finally {
    revalidatePath('/events'); // this revalidates the events page to show the new event (i.e refetches new data in page)
  }
}

export async function updateEvent(
  id: string,
  unsafeData: z.infer<typeof eventFormSchema>,
): Promise<void> {
  try {
    // Authenticate the user with Clerk
    const { userId } = await auth();
    // Trying to validate the data against the schema
    const { success, data } = eventFormSchema.safeParse(unsafeData);
    if (!success || !userId)
      throw new Error('Invalid data or user not authenticated');

    // If validation is successful, proceed with event update and put the to database
    const { rowCount } = await db
      .update(EventTable)
      .set({ ...data, clerkUserId: userId })
      .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

    // If no rows were updated, it means the event was not found or the user does not have permission to update it
    if (rowCount === 0)
      throw new Error(
        'Event not found or you do not have permission to update it.',
      );
  } catch (error: any) {
    throw new Error(`Failed to update event: ${error.message || error}`);
  } finally {
    revalidatePath('/events'); // this revalidates the events page to show the updated event (i.e refetches new data in page)
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    // Authenticate the user with Clerk
    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');

    const { rowCount } = await db
      .delete(EventTable)
      .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

    if (rowCount === 0)
      throw new Error(
        'Event not found or you do not have permission to delete it.',
      );
  } catch (error: any) {
    throw new Error(`Failed to delete event: ${error.message || error}`);
  } finally {
    revalidatePath('/events'); // this revalidates the events page to show the deleted event (i.e refetches new data in page)
  }
}

type EventRow = typeof EventTable.$inferSelect;

// This function fetches all events (active and inactive) for the authenticated user
export async function getEvents(clerkUserId: string): Promise<EventRow[]> {
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, clerkUserId),
    orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
  });
  return events;
}

export async function getEvent(
  clerkUserId: string,
  eventId: string,
): Promise<EventRow | undefined> {
  const event = await db.query.EventTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.clerkUserId, clerkUserId), eq(table.id, eventId)),
  });
  return event ?? undefined;
}

export type PublicEvent = Omit<EventRow, 'isActive'> & { isActive: true }; // Define a type for public events, which are always active type safety

// Fetch all active public events for a specific user
export async function getPublicEvents(
  clerkUserId: string,
): Promise<PublicEvent[]> {
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { and, eq }) =>
      and(eq(userIdCol, clerkUserId), eq(isActive, true)),
    orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
  });
  return events as PublicEvent[];
}
