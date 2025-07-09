import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from './ui/card';
import { Button } from './ui/button';

export default function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { name: string; description: string | null };
  calendarUser: { id: string; fullName: string | null };
}) {
  return (
    <Card className='max-w-md mx-auto border-4 border-blue-500/10 shadow-2xl transition delay-150 duration-500 ease-in-out hover:translate-y-1 hover:scale-125'>
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>

        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {calendarUser.fullName} is currently booked up. Please check back later
        or choose an event with a shorter duration.
      </CardContent>
      <CardFooter>
        <Button
          className='cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600'
          asChild
        >
          <Link href={`/book/${calendarUser.id}`}>Choose another event</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
