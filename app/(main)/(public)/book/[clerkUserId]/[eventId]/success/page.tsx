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
import { AlertTriangle } from 'lucide-react';

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
  searchParams: Promise<{ startTime: string }>;
}) {
  const { clerkUserId, eventId } = await params;
  const { startTime } = await searchParams;

  const event = await getEvent(clerkUserId, eventId);

  if (!event)
    return (
      <div>
        <AlertTriangle className='w-5 h-5' />
        <span>This event doesn't exist anymore.</span>
      </div>
    );

  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);

  const startTimeDate = new Date(startTime);

  // Render the success message with booking details
  return (
    <Card className='max-w-xl mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>
          ✅ Successfully Booked {event.name} with {calendarUser.fullName}
        </CardTitle>

        <CardDescription>{formatDateTime(startTimeDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        You should recieve an email conformation shortly. You can safely close
        this page now.
      </CardContent>
    </Card>
  );
}
