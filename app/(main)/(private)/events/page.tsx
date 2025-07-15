import EventCard from '@/components/cards/EventCard';
import { Button } from '@/components/ui/button';
import { getEvents } from '@/server/actions/events';
import { auth } from '@clerk/nextjs/server';
import { CalendarPlus, CalendarRange } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  const events = await getEvents(userId);

  return (
    <section className='flex flex-col items-center gap-16 animate-fade-in'>
      {/* Should have page title and add event button */}
      <div className='flex items-baseline gap-4'>
        <h1 className='text-4xl xl:text-5xl font-black mb-6'>Events</h1>
        <Button
          className='bg-solocal-neutral-soft-cream/60 hover:bg-solocal-neutral-off-white/75 text-white py-6 hover:scale-110 duration-200 ease-out border-b-4 rounded-2xl shadow-accent-foreground text-2xl font-black'
          asChild
        >
          <Link href={'/events/new'}>
            <CalendarPlus className='mr-4 size-7' /> Create Event
          </Link>
        </Button>
      </div>

      {/* show the events cards if any exists, else show empty slate */}
      {events.length > 0 ? (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-10'>
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        // When there are no events, show an empty slate
        <div className='flex flex-col items-center gap-4'>
          <CalendarRange className='size-16 mx-auto text-gray-500' />
          You do not have any events yet. Create your first event to get
          started!
          <Button
            className='bg-solocal-neutral-soft-cream/60 hover:bg-solocal-neutral-off-white/75 text-white py-6 hover:scale-110 duration-200 ease-out border-b-4 rounded-2xl shadow-accent-foreground text-2xl font-black'
            asChild
          >
            <Link href={'/events/new'}>
              <CalendarPlus className='mr-4 size-7 shadow-md' /> New Event
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
