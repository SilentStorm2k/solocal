import { EventForm } from '@/components/forms/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEvent } from '@/server/actions/events';
import { auth } from '@clerk/nextjs/server';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { eventId } = await params;
  const event = await getEvent(userId, eventId);

  if (!event)
    return (
      <h1 className='text-4xl xl:text-5xl font-black mb-6'>Event Not Found</h1>
    );

  return (
    <Card className='max-w-md mx-auto border-6 border-solocal-neutral-soft-cream/80 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm
          event={{
            ...event,
            description: event.description || undefined,
          }}
        />
      </CardContent>
    </Card>
  );
}
