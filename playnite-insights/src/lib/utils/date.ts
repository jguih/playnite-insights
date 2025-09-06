import { m } from '$lib/paraglide/messages';

const monthNames = [
	m.month_january(),
	m.month_february(),
	m.month_march(),
	m.month_april(),
	m.month_may(),
	m.month_june(),
	m.month_july(),
	m.month_august(),
	m.month_september(),
	m.month_october(),
	m.month_november(),
	m.month_december(),
];

/**
 * @param inclusive Whether the returned list should include the current month or not.
 * @default true
 * @returns Last six months including this month
 */
export const getLastSixMonths = (inclusive: boolean = true): Array<string> => {
	const today = new Date();
	let date;
	const months: Array<string> = [];
	for (let i = inclusive ? 5 : 6; i >= 0; i -= 1) {
		date = new Date(today.getFullYear(), today.getMonth() - i, 1);
		months.push(monthNames[date.getMonth()]);
	}
	return months;
};

/**
 * @param inclusive Whether the returned list should include the current month or not.
 * @default true
 * @returns Last six months including this month
 */
export const getLastSixMonthsAbreviated = (inclusive: boolean = true): Array<string> => {
	const today = new Date();
	let date;
	const months: Array<string> = [];
	for (let i = inclusive ? 5 : 6; i >= 0; i -= 1) {
		date = new Date(today.getFullYear(), today.getMonth() - i, 1);
		months.push(monthNames[date.getMonth()].substring(0, 3) + '.');
	}
	return months;
};
