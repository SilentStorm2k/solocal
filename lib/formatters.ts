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
