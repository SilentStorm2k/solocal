import { DAYS_OF_WEEK_IN_ORDER } from '@/constants';
import { timeToFloat } from '@/lib/utils';
import { time } from 'console';
import z from 'zod';

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  availabilities: z
    .array(
      z.object({
        startTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            'Time must be in the format HH:MM',
          ),
        endTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            'Time must be in the format HH:MM',
          ),
        dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
      }),
    )
    .superRefine((availabilities, ctx) => {
      // Check that each availability has startTime before endTime)
      availabilities.forEach((availability, index) => {
        const overlap = availabilities.some((a, i) => {
          return (
            i !== index &&
            a.dayOfWeek === availability.dayOfWeek &&
            timeToFloat(a.startTime) < timeToFloat(availability.endTime) &&
            timeToFloat(a.endTime) > timeToFloat(availability.startTime)
          );
        });
        if (overlap) {
          ctx.addIssue({
            code: 'custom',
            message: `This availability overlaps with another availability`,
            path: [index, 'startTime'],
          });
        }

        if (
          timeToFloat(availability.startTime) >=
          timeToFloat(availability.endTime)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `End time must be after start time`,
            path: [index, 'endTime'],
          });
        }
      });
    }),
});
