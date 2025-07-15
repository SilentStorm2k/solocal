import { formatEventDescription } from '@/lib/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';

type PublicEventCardProps = {
  id: string;
  name: string;
  clerkUserId: string;
  description: string | null;
  durationInMinutes: number;
};
export default function PublicEventCard({
  id,
  name,
  description,
  clerkUserId,
  durationInMinutes,
}: PublicEventCardProps) {
  return (
    <Card className='flex flex-col border-4 border-solocal-neutral-off-white/75 shadow-2xl transition delay-140 duration-300 ease-in-out hover:translate-y-1 hover:scale-110'>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description && <CardContent>{description}</CardContent>}
      <CardFooter className='flex justify-center gap-2 mt-auto'>
        <Button
          className='cursor-pointer hover:scale-105 bg-solocal-neutral-soft-cream/60 hover:bg-solocal-neutral-off-white/90'
          asChild
        >
          <Link href={`/book/${clerkUserId}/${id}`}>Select</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
