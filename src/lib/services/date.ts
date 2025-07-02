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
	m.month_december()
];

/**
 *
 * @returns Last six months including this month
 */
export const getLastSixMonthsInclusive = (): Array<string> => {
	const today = new Date();
	let date;
	const months: Array<string> = [];
	for (let i = 5; i >= 0; i -= 1) {
		date = new Date(today.getFullYear(), today.getMonth() - i, 1);
		months.push(monthNames[date.getMonth()]);
	}
	return months;
};

/**
 *
 * @returns Last six months, not including this month
 */
export const getLastSixMonths = (): Array<string> => {
	const today = new Date();
	let date;
	const months: Array<string> = [];
	for (let i = 6; i > 0; i -= 1) {
		date = new Date(today.getFullYear(), today.getMonth() - i, 1);
		months.push(monthNames[date.getMonth()]);
	}
	return months;
};
