import { time } from "console";

// formats duration in minutes to a human-readable string
export function formatEventDescription(durationInMinutes: number): string {
	const hours = Math.floor(durationInMinutes / 60);
	const minutes = durationInMinutes % 60;

	const minuteString = `${minutes} min${minutes > 1 ? "s" : ""}`;
	const hourString = `${hours} hr${hours > 1 ? "s" : ""}`;
	if (hours === 0) return minuteString;
	if (minutes === 0) return hourString;

	return `${hourString} ${minuteString}`;
}

export function formatTimeZoneOffset(timezone: string): string {
	return (
		new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "shortOffset",
		})
			.formatToParts(new Date())
			.find((part) => part.type === "timeZoneName")?.value || ""
	);
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
	timeStyle: "short",
});

export function formatTimeString(date: Date) {
	return timeFormatter.format(date);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

export function formatDate(date: Date) {
	return dateFormatter.format(date);
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
	timeStyle: "short",
	dateStyle: "medium",
});

export function formatDateTime(date: Date) {
	return dateTimeFormatter.format(date);
}
