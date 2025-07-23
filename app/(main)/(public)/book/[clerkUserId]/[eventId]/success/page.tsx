import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateTime } from '@/lib/formatters';
import { getEvent } from '@/server/actions/events';
import { clerkClient } from '@clerk/nextjs/server';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { AlertTriangle } from 'lucide-react';

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
  searchParams: Promise<{ startTime: string; timeZone: string }>;
}) {
  const { clerkUserId, eventId } = await params;
  const { startTime, timeZone } = await searchParams;

  const event = await getEvent(clerkUserId, eventId);

  if (!event || !startTime || !timeZone)
    return (
      <Card className='max-w-xl mx-auto border-3 border-solocal-neutral-off-white/65 shadow-2xl shadow-accent-foreground'>
        <CardHeader>
          <CardTitle className='flex justify-center items-center gap-2'>
            <AlertTriangle className='w-5 h-5' />
            <span>This event doesn't exist anymore.</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );

  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);
  let timeInTimeZone: string = 'Invalid Time';

  try {
    const startTimeDate = parseISO(startTime);
    if (isNaN(startTimeDate.getTime())) throw new Error('Illegal time string');
    timeInTimeZone = formatInTimeZone(
      startTimeDate,
      timeZone,
      'h:mm a - MMMM do, yyyy zzz',
    );
  } catch (error) {
    return (
      <Card className='max-w-xl mx-auto border-3 border-solocal-neutral-off-white/65 shadow-2xl shadow-accent-foreground'>
        <CardHeader>
          <CardTitle className='flex justify-center items-center gap-2'>
            <AlertTriangle className='w-5 h-5' />
            <span>This event doesn't exist anymore.</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Render the success message with booking details
  return (
    <Card className='max-w-xl mx-auto border-8 border-solocal-neutral-off-white/65 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>
          ✅ Successfully Booked {event.name} with {calendarUser.fullName}
        </CardTitle>

        <CardDescription>{timeInTimeZone}</CardDescription>
      </CardHeader>
      <CardContent>
        You should receive an email conformation shortly. You can safely close
        this page now.
      </CardContent>
    </Card>
  );
}
