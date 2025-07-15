'use client';

import { eventFormSchema } from '@/schema/events';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import Link from 'next/link';
import { createEvent, deleteEvent, updateEvent } from '@/server/actions/events';
import { useRouter } from 'next/navigation';

// Using for creating/modifying/deleting events
export function EventForm({
  event,
}: {
  event?: {
    id: string;
    name: string;
    description?: string;
    durationInMinutes: number;
    isActive: boolean;
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? { ...event }
      : {
          name: '',
          isActive: true,
          durationInMinutes: 30,
          description: '',
        },
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const action =
      event == null ? createEvent : updateEvent.bind(null, event.id);
    try {
      await action(values);
      router.push('/events');
    } catch (error: any) {
      form.setError('root', {
        message: `There was an error saving your event: ${error.message}`,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex gap-6 flex-col'
      >
        {/* Show any form errors */}
        {form.formState.errors.root && (
          <div className='text-destructive text-sm'>
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name users will see when booking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='durationInMinutes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormDescription>In minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className='resize-none h-32' {...field} />
              </FormControl>
              <FormDescription>
                Optional description of the event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='isActive'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-2'>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Active</FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Our Cancel and Save buttons */}
        <div className='flex gap-2 justify-end'>
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className='cursor-pointer hover:scale-105 hover:bg-red-600 bg-red-400 text-white py-2 px-4 rounded-lg'
                  variant={'destructive'}
                  disabled={isDeletePending || form.formState.isSubmitting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-red-500 hover:bg-red-700 cursor-pointer '
                    disabled={isDeletePending || form.formState.isSubmitting}
                    onClick={() => {
                      startDeleteTransition(async () => {
                        try {
                          await deleteEvent(event.id);
                          router.push('/events');
                        } catch (error: any) {
                          form.setError('root', {
                            message: `There was an error deleting your event: ${error.message}`,
                          });
                        }
                      });
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            disabled={isDeletePending || form.formState.isSubmitting}
            type='button'
            variant={'outline'}
            asChild
          >
            <Link href='/events'>Cancel</Link>
          </Button>

          <Button
            className='cursor-pointer hover:scale-105 bg-solocal-neutral-soft-cream/60 hover:bg-solocal-neutral-off-white/90'
            disabled={isDeletePending || form.formState.isSubmitting}
            type='submit'
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
