import { EventForm } from '@/components/forms/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewEventPage() {
  return (
    <Card className='max-w-md mx-auto border-6 border-solocal-neutral-off-white/70 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>New event</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm />
      </CardContent>
    </Card>
  );
}
