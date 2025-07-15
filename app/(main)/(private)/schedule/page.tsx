import ScheduleForm from '@/components/forms/ScheduleForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchedule } from '@/server/actions/schedule';
import { auth } from '@clerk/nextjs/server';

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const schedule = await getSchedule(userId);

  // render the schedule page with the fetched schedule data using a schedule form
  return (
    <Card className='max-w-md mx-auto border-6 border-solocal-neutral-off-white/70 shadow-2xl shadow-accent-foreground'>
      <CardHeader>
        <CardTitle>My schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  );
}
