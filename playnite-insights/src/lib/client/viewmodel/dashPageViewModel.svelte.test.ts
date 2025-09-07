import { describe, expect, it } from 'vitest';
import { DashPageViewModel, defaultPageData } from './dashPageViewModel.svelte';

describe('DashPageViewModel', () => {
	it('returns default values', () => {
		// Arrange
		const vm = new DashPageViewModel({ dashSignal: { pageData: null } });
		// Act
		const data = vm.data;
		// Assert
		expect(data).toBeTruthy();
	});

	it.each([
		{ total: 100, played: 10, expected: 10 },
		{ total: 50, played: 25, expected: 50 },
		{ total: 10, played: 5, expected: 50 },
		{ total: 0, played: 0, expected: 0 },
	])(
		'calculates correct played percentage for total=$total played=$played',
		({ total, played, expected }) => {
			// Arrange
			const vm = new DashPageViewModel({
				dashSignal: {
					pageData: {
						...defaultPageData,
						totalGamesInLibrary: total,
						played,
					},
				},
			});
			// Act
			const percent = vm.playedPercentage;
			// Assert
			expect(percent).toBe(expected);
		},
	);

	it.each([
		{ seconds: 60, expected: /0h 1m/ },
		{ seconds: 3600, expected: /1h 0m/ },
		{ seconds: 3660, expected: /1h 1m/ },
		{ seconds: 7322, expected: /2h 2m/ },
		{ seconds: 86400, expected: /24h 0m/ },
		{ seconds: 65, expected: /0h 1m/ },
		{ seconds: 0, expected: /0h 0m/ },
	])('calculates total playtime', ({ seconds, expected }) => {
		// Arrange
		const vm = new DashPageViewModel({
			dashSignal: {
				pageData: {
					...defaultPageData,
					totalPlaytimeSeconds: seconds,
				},
			},
		});
		// Act
		const percent = vm.totalPlaytime;
		// Assert
		expect(percent).toMatch(expected);
	});
});
