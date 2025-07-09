import { DAYS_OF_WEEK_IN_ORDER } from '@/constants';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const scheduleDayOfWeekEnum = pgEnum('day', DAYS_OF_WEEK_IN_ORDER);

const createdAt = timestamp('createdAt').notNull().defaultNow();

const updatedAt = timestamp('updatedAt')
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date()); // automatically updates to current time on update
// Our events table with name, description and duration
export const EventTable = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'), // optional description
    durationInMinutes: integer('durationInMinutes').notNull(),
    clerkUserId: text('clerkUserId').notNull(), // Id of user who created event (from Clerk)
    isActive: boolean('isActive').notNull().default(true), // whether the event is active/not
    createdAt, // timestamp for when created
    updatedAt, // timestamp when last updated
  },
  (table) => [
    index('clerkUserIdIndex').on(table.clerkUserId), // index on clearUserId for faster querying
  ],
);

// Define a "schedules" table, one per user, with timezone and timestamps
export const ScheduleTable = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  timezone: text('timezone').notNull(),
  clerkUserId: text('clerkUserId').notNull().unique(),
  createdAt,
  updatedAt,
});

// Defining relationship between ScheduleTable and ScheduleAvailabilityTable since each schedule can have many availabilities
export const scheduleRelations = relations(ScheduleTable, ({ many }) => ({
  availabilities: many(ScheduleAvailabilityTable), // one-to-many relationship
}));

// Define the available schedules tables
export const ScheduleAvailabilityTable = pgTable(
  'scheduleAvailabilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scheduleId: uuid('scheduleId') // foreign key from scheduleTable
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: 'cascade' }),
    startTime: text('startTime').notNull(),
    endTime: text('endTime').notNull(),
    dayOfWeek: scheduleDayOfWeekEnum('dayOfWeek').notNull(),
  },
  (table) => [
    index('scheduleIdIndex').on(table.scheduleId),
    // index on the foreign key for faster lookups
  ],
);

// We also need to define the reverse relation for : each availability belonging to one schedule
export const ScheduleAvailabilityRelations = relations(
  ScheduleAvailabilityTable,
  ({ one }) => ({
    schedule: one(ScheduleTable, {
      fields: [ScheduleAvailabilityTable.scheduleId], // local key
      references: [ScheduleTable.id], // foreign key
    }),
  }),
);
