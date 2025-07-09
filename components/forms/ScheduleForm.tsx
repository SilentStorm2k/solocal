'use client';
import { DAYS_OF_WEEK_IN_ORDER } from '@/constants';
import { timeToFloat } from '@/lib/utils';
import { scheduleFormSchema } from '@/schema/schedule';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { formatTimeZoneOffset } from '@/lib/formatters';
import { Fragment } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { saveSchedule } from '@/server/actions/schedule';

type Availability = {
  startTime: string; // ISO 8601 date string
  endTime: string; // ISO 8601 date string
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export default function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        schedule?.availabilities.toSorted(
          (a, b) => timeToFloat(a.startTime) - timeToFloat(b.startTime),
        ) || [],
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: 'availabilities',
    control: form.control,
  });
  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({
      ...field,
      index,
    })),
    (availability) => availability.dayOfWeek,
  );

  async function onSubmit(data: z.infer<typeof scheduleFormSchema>) {
    try {
      await saveSchedule(data);
      toast('Schedule saved successfully!', {
        duration: 5000,
        className:
          '!rounded-3xl !py-8 !px-5 !justify-center !text-lg !font-black !text-green-400',
      });
    } catch (error: any) {
      form.setError('root', {
        message: `There was an error saving your message: ${error.message}`,
      });
    }
  }
  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {form.formState.errors.root && (
          <div className='text-destructive text-sm'>
            {form.formState.errors.root.message}
          </div>
        )}
        {/* Timezone selection */}
        <FormField
          control={form.control}
          name='timezone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                      {` (${formatTimeZoneOffset(tz)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className='grid grid-cols-[auto_auto] gap-4'>
          {/* Days of the week header */}
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className='capitalize text-sm font-semibold'>
                {dayOfWeek.substring(0, 3)}
              </div>

              {/* adding availability for specific day */}
              <div className='flex flex-col gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='size-6 p-1 cursor-pointer hover:scale-150'
                  onClick={() => {
                    addAvailability({
                      startTime: '09:00',
                      endTime: '17:00',
                      dayOfWeek,
                    });
                  }}
                >
                  <Plus color='red' />
                </Button>
                {/* My availabilities grouped by days */}
                {groupedAvailabilityFields[dayOfWeek]?.map(
                  (field, labelIndex) => (
                    <div className='flex flex-col gap-4' key={field.id}>
                      <div className='flex items-center gap-2'>
                        {/* Start time input */}
                        <FormField
                          control={form.control}
                          name={`availabilities.${field.index}.startTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className='w-24'
                                  aria-label={`${dayOfWeek} Start Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {/* end time input */}
                        <FormField
                          control={form.control}
                          name={`availabilities.${field.index}.endTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className='w-24'
                                  aria-label={`${dayOfWeek} End Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Remove availability button */}
                        <Button
                          className='size-6 p-1 cursor-pointer hover:bg-red-900'
                          variant={'destructive'}
                          type='button'
                          onClick={() => removeAvailability(field.index)}
                        >
                          <X />
                        </Button>
                      </div>

                      {/* Field level error messages */}
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index,
                          )?.root?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index,
                          )?.startTime?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index,
                          )?.endTime?.message
                        }
                      </FormMessage>
                    </div>
                  ),
                )}
              </div>
            </Fragment>
          ))}
        </div>

        {/* Save button */}
        <div className='flex justify-start gap-2'>
          <Button
            className='cursor-pointer hover:scale-110 hover:bg-blue-600'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
