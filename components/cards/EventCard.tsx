import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card';
import { formatEventDescription } from '@/lib/formatters';
import { Button } from '../ui/button';
import Link from 'next/link';
import { CopyEventButton } from '../CopyEventButton';

type EventCardProps = {
  id: string;
  isActive: boolean;
  name: string;
  description: string | null;
  durationInMinutes: number;
  clerkUserId: string;
};
export default function EventCard({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  clerkUserId,
}: EventCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col border-4 border-solocal-neutral-soft-cream/60 shadow-2xl transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110',
        !isActive &&
          'bg-solocal-accent-clay/45 border-solocal-accent-muted-rose/70',
      )}
    >
      <CardHeader className={cn(!isActive && 'opacity-50')}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>

      {/* Show description if not null */}
      {description != null && (
        <CardContent className={cn(!isActive && 'opacity-50')}>
          {description}
        </CardContent>
      )}

      <CardFooter className='flex justify-end gap-2 mt-auto'>
        {/* Copy link button (for sharable link) */}
        {isActive && (
          <CopyEventButton
            eventId={id}
            clerkUserId={clerkUserId}
            variant='outline'
          />
        )}

        {/* Edit button */}
        <Button
          className='cursor-pointer hover:scale-105 bg-solocal-neutral-soft-cream/60 hover:bg-solocal-neutral-off-white/90'
          asChild
        >
          <Link href={`/events/${id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
