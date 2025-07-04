"use server";

import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";
import { revalidatePath } from "next/cache";
import z from "zod";

type ScheduleRow = typeof ScheduleTable.$inferSelect;
type AvailabilityRow = typeof ScheduleAvailabilityTable.$inferSelect;

export type fullSchedule = ScheduleRow & { availabilities: AvailabilityRow[] };

export async function getSchedule(userId: string): Promise<fullSchedule> {
	const schedule = await db.query.ScheduleTable.findFirst({
		where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
		with: {
			availabilities: true, // Include all availabilities for this schedule
		},
	});

	return schedule as fullSchedule;
}

export async function saveSchedule(
	unsafeData: z.infer<typeof scheduleFormSchema>
) {
	try {
		const { userId } = await auth();

		const { success, data } = scheduleFormSchema.safeParse(unsafeData);

		if (!userId || !success)
			throw new Error("Invalid schedule data or User not authenticated");

		const { availabilities, ...scheduleData } = data;

		// Upsert the schedule
		const [{ id: scheduleId }] = await db
			.insert(ScheduleTable)
			.values({
				...scheduleData,
				clerkUserId: userId,
			})
			.onConflictDoUpdate({
				target: ScheduleTable.clerkUserId,
				set: scheduleData,
			})
			.returning({ id: ScheduleTable.id });

		const statements: [BatchItem<"pg">] = [
			// Delete existing availabilities for this schedule
			db
				.delete(ScheduleAvailabilityTable)
				.where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId)),
		];

		// insert new availabilities
		if (availabilities.length > 0) {
			statements.push(
				db.insert(ScheduleAvailabilityTable).values(
					availabilities.map((availability) => ({
						...availability,
						scheduleId,
					}))
				)
			);
		}

		await db.batch(statements);
	} catch (error: any) {
		throw new Error(`Failed to save schedule: ${error.message || error}`);
	} finally {
		// Revalidate the schedule page to show the updated schedule
		revalidatePath("/schedule");
	}
}
