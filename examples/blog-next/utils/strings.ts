export function formatDate(date: string | Date) {
	const d = new Date(date);

	const day = d.getDate();
	const month = d.toLocaleString("en-US", {month: "short"});
	const year = d.getFullYear();

	const ordinalSuffix = getOrdinalSuffix(day);

	return `${day}${ordinalSuffix} ${month} ${year}`;
}

function getOrdinalSuffix(day: number): string {
	if (day > 3 && day < 21) return "th";
	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}
