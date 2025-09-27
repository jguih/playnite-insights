import type { FullGame } from '@playnite-insights/lib/client';
import { FullGameFactory, makeFetchClientMock, testUtils } from '@playnite-insights/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageProps } from '../../../routes/$types';
import { GameStore } from '../app-state/stores/gameStore.svelte';
import { HomePageViewModel } from './homePageViewModel.svelte';

const defaultPageData: PageProps['data'] = {
	appName: 'test',
	developers: [],
	genres: [],
	installed: false,
	notInstalled: false,
	page: '1',
	pageSize: '100',
	platforms: [],
	publishers: [],
	query: null,
	sortBy: 'LastActivity',
	sortOrder: 'desc',
};
const factory = new FullGameFactory();
const fetchClient = makeFetchClientMock();
const gameStore = new GameStore({ httpClient: fetchClient });

describe('HomePageViewModel', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it.each([
		{ name: 'Grim Dawn', query: 'grim' },
		{ name: 'Grim Dawn', query: 'dawn' },
		{ name: 'Cyberpunk 2077', query: 'cyberpunk' },
		{ name: 'Titanfall 2', query: 'TitanfaLL 2' },
		{ name: 'The Witcher 3', query: 'wItChEr 3' },
	])('filters by query: $query', async ({ name, query }) => {
		// Arrange
		const data: PageProps['data'] = {
			...defaultPageData,
			query: query,
		};
		const game: FullGame = factory.getGame({ Name: name });
		const games: FullGame[] = factory.getGames(20).map((g) => ({ ...g, Name: 'Other Game' }));
		games.push(game);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const vm = new HomePageViewModel({
			getPageData: () => data,
			gameStore: gameStore,
		});
		// Act
		const filteredGames = vm.games;
		const filteredGamesIds = filteredGames?.map((g) => g.Id);
		// Assert
		expect(filteredGames).toBeTruthy();
		expect(filteredGamesIds).toBeTruthy();
		expect(filteredGames).toHaveLength(1);
		expect(filteredGamesIds).toContain(game.Id);
	});

	it.each([{ query: '' }, { query: null }])(
		'when filtering by query, returns all games if query is: $query',
		async ({ query }) => {
			// Arrange
			const data: PageProps['data'] = {
				...defaultPageData,
				query: query,
			};
			const gamesCount = 20;
			const games: FullGame[] = factory.getGames(gamesCount);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const vm = new HomePageViewModel({
				getPageData: () => data,
				gameStore: gameStore,
			});
			// Act
			const filteredGames = vm.games;
			// Assert
			expect(filteredGames).toBeTruthy();
			expect(filteredGames).toHaveLength(gamesCount);
		},
	);

	it.each([{ installed: true }, { installed: false }])(
		'filters by installation status: $installed',
		async ({ installed }) => {
			// Arrange
			const data: PageProps['data'] = {
				...defaultPageData,
				installed: installed,
				notInstalled: !installed,
			};
			const gamesCount = 20;
			const gameUnderTest: FullGame = factory.getGame({ IsInstalled: +installed });
			const games: FullGame[] = factory.getGames(gamesCount, { IsInstalled: +!installed });
			games.push(gameUnderTest);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const vm = new HomePageViewModel({
				getPageData: () => data,
				gameStore: gameStore,
			});
			// Act
			const filteredGames = vm.games;
			const filteredGamesIds = filteredGames?.map((g) => g.Id);
			// Assert
			expect(filteredGames).toBeTruthy();
			expect(filteredGames).toHaveLength(1);
			expect(filteredGamesIds).toContain(gameUnderTest.Id);
		},
	);

	it.each([
		// Number of games under test is always 5
		{
			title: 'single dev, filter matches all',
			gameDeveloperIds: ['Capcom'],
			filterDeveloperIds: ['Capcom'],
			expectedMatch: 5,
		},
		{
			title: 'multiple devs, filter matches only half',
			gameDeveloperIds: ['CDProject RED', 'Respawn'],
			filterDeveloperIds: ['Respawn'],
			expectedMatch: 2 + 1, // 2 per dev 1 with both
		},
		{
			title: 'multiple devs, filter matches all',
			gameDeveloperIds: ['CDProject RED', 'Respawn'],
			filterDeveloperIds: ['CDProject RED', 'Respawn'],
			expectedMatch: 4 + 1, // 2 per dev 1 with both
		},
		{
			title: 'filter does not match any dev',
			gameDeveloperIds: ['Capcom'],
			filterDeveloperIds: ['Bethesda'],
			expectedMatch: 0,
		},
		{
			title: 'empty filter matches all devs',
			gameDeveloperIds: ['Focus'],
			filterDeveloperIds: [],
			expectedMatch: 20 + 5, // 20 games plus 5 under testing
		},
	])(
		'filters by developers: $title',
		async ({ gameDeveloperIds, filterDeveloperIds, expectedMatch }) => {
			// Arrange
			const data: PageProps['data'] = {
				...defaultPageData,
				developers: filterDeveloperIds,
			};
			const gamesUnderTest: FullGame[] =
				gameDeveloperIds.length === 1
					? factory.getGames(5, { Developers: [gameDeveloperIds[0]] })
					: [
							...factory.getGames(2, { Developers: [gameDeveloperIds[0]] }),
							...factory.getGames(2, { Developers: [gameDeveloperIds[1]] }),
							factory.getGame({ Developers: gameDeveloperIds }),
						];
			const otherGames: FullGame[] = factory.getGames(20, {
				Developers: ['dev1', 'dev2', 'dev3', 'dev4'],
			});
			const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const vm = new HomePageViewModel({
				getPageData: () => data,
				gameStore: gameStore,
			});
			// Act
			const filteredGames = vm.games;
			// Assert
			expect(filteredGames).toHaveLength(expectedMatch);
			expect(
				filterDeveloperIds.length === 0 ||
					filteredGames?.every((g) => g.Developers.some((d) => filterDeveloperIds.includes(d))),
			).toBe(true);
		},
	);

	it.each([
		// Number of games under test is always 5
		{
			title: 'single publisher, filter matches all',
			gamePublisherIds: ['Focus'],
			filterPublisherIds: ['Focus'],
			expectedMatch: 5,
		},
		{
			title: 'multiple publishers, filter matches only half',
			gamePublisherIds: ['Focus', 'Dumativa'],
			filterPublisherIds: ['Dumativa'],
			expectedMatch: 2 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'multiple publishers, filter matches all',
			gamePublisherIds: ['Focus', 'Nuuvem'],
			filterPublisherIds: ['Focus', 'Nuuvem'],
			expectedMatch: 4 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'filter does not match any publisher',
			gamePublisherIds: ['Focus', 'Dumativa'],
			filterPublisherIds: ['Nuuvem'],
			expectedMatch: 0,
		},
		{
			title: 'empty filter matches all publishers',
			gamePublisherIds: ['Focus'],
			filterPublisherIds: [],
			expectedMatch: 20 + 5, // 20 games plus 5 under testing
		},
	])(
		'filters by publishers: $title',
		async ({ gamePublisherIds, filterPublisherIds, expectedMatch }) => {
			// Arrange
			const data: PageProps['data'] = {
				...defaultPageData,
				publishers: filterPublisherIds,
			};
			const gamesUnderTest: FullGame[] =
				gamePublisherIds.length === 1
					? factory.getGames(5, { Publishers: [gamePublisherIds[0]] })
					: [
							...factory.getGames(2, { Publishers: [gamePublisherIds[0]] }),
							...factory.getGames(2, { Publishers: [gamePublisherIds[1]] }),
							factory.getGame({ Publishers: gamePublisherIds }),
						];
			const otherGames: FullGame[] = factory.getGames(20, {
				Publishers: ['pub1', 'pub2', 'pub3'],
			});
			const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const vm = new HomePageViewModel({
				getPageData: () => data,
				gameStore: gameStore,
			});
			// Act
			const filteredGames = vm.games;
			// Assert
			expect(filteredGames).toHaveLength(expectedMatch);
			expect(
				filterPublisherIds.length === 0 ||
					filteredGames?.every((g) => g.Publishers.some((d) => filterPublisherIds.includes(d))),
			).toBe(true);
		},
	);

	it.each([
		// Number of games under test is always 5
		{
			title: 'single platform, filter matches all',
			gamePlatformIds: ['PC'],
			filterPlatformIds: ['PC'],
			expectedMatch: 5,
		},
		{
			title: 'multiple platforms, filter matches only half',
			gamePlatformIds: ['PC', 'Linux'],
			filterPlatformIds: ['Linux'],
			expectedMatch: 2 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'multiple platforms, filter matches all',
			gamePlatformIds: ['PC', 'Xbox'],
			filterPlatformIds: ['Xbox', 'PC'],
			expectedMatch: 4 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'filter does not match any platform',
			gamePlatformIds: ['PC', 'Xbox'],
			filterPlatformIds: ['PS'],
			expectedMatch: 0,
		},
		{
			title: 'empty filter matches all platforms',
			gamePlatformIds: ['Xbox'],
			filterPlatformIds: [],
			expectedMatch: 20 + 5, // 20 games plus 5 under testing
		},
	])(
		'filters by platforms: $title',
		async ({ gamePlatformIds, filterPlatformIds, expectedMatch }) => {
			// Arrange
			const data: PageProps['data'] = {
				...defaultPageData,
				platforms: filterPlatformIds,
			};
			const gamesUnderTest: FullGame[] =
				gamePlatformIds.length === 1
					? factory.getGames(5, { Platforms: [gamePlatformIds[0]] })
					: [
							...factory.getGames(2, { Platforms: [gamePlatformIds[0]] }),
							...factory.getGames(2, { Platforms: [gamePlatformIds[1]] }),
							factory.getGame({ Platforms: gamePlatformIds }),
						];
			const otherGames: FullGame[] = factory.getGames(20, {
				Platforms: ['plat1', 'plat2', 'plat3'],
			});
			const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const vm = new HomePageViewModel({
				getPageData: () => data,
				gameStore: gameStore,
			});
			// Act
			const filteredGames = vm.games;
			// Assert
			expect(filteredGames).toHaveLength(expectedMatch);
			expect(
				filterPlatformIds.length === 0 ||
					filteredGames?.every((g) => g.Platforms.some((d) => filterPlatformIds.includes(d))),
			).toBe(true);
		},
	);

	it.each([
		// Number of games under test is always 5
		{
			title: 'single genre, filter matches all',
			gameGenreIds: ['RPG'],
			filterGenreIds: ['RPG'],
			expectedMatch: 5,
		},
		{
			title: 'multiple genres, filter matches only half',
			gameGenreIds: ['RPG', 'Action'],
			filterGenreIds: ['Action'],
			expectedMatch: 2 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'multiple genres, filter matches all',
			gameGenreIds: ['RPG', '4X'],
			filterGenreIds: ['4X', 'RPG'],
			expectedMatch: 4 + 1, // 2 per publisher 1 with both
		},
		{
			title: 'filter does not match any genre',
			gameGenreIds: ['Strategy', 'Platform'],
			filterGenreIds: ['FPS'],
			expectedMatch: 0,
		},
		{
			title: 'empty filter matches all genres',
			gameGenreIds: ['Incremental'],
			filterGenreIds: [],
			expectedMatch: 20 + 5, // 20 games plus 5 under testing
		},
	])('filters by genres: $title', async ({ gameGenreIds, filterGenreIds, expectedMatch }) => {
		// Arrange
		const data: PageProps['data'] = {
			...defaultPageData,
			genres: filterGenreIds,
		};
		const gamesUnderTest: FullGame[] =
			gameGenreIds.length === 1
				? factory.getGames(5, { Genres: [gameGenreIds[0]] })
				: [
						...factory.getGames(2, { Genres: [gameGenreIds[0]] }),
						...factory.getGames(2, { Genres: [gameGenreIds[1]] }),
						factory.getGame({ Genres: gameGenreIds }),
					];
		const otherGames: FullGame[] = factory.getGames(20, {
			Genres: ['genre1', 'genre2', 'genre3'],
		});
		const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const vm = new HomePageViewModel({
			getPageData: () => data,
			gameStore: gameStore,
		});
		// Act
		const filteredGames = vm.games;
		// Assert
		expect(filteredGames).toHaveLength(expectedMatch);
		expect(
			filterGenreIds.length === 0 ||
				filteredGames?.every((g) => g.Genres.some((d) => filterGenreIds.includes(d))),
		).toBe(true);
	});

	it('returns all games if filtering by installed and not installed', async () => {
		// Arrange
		const data: PageProps['data'] = {
			...defaultPageData,
			installed: true,
			notInstalled: true,
			pageSize: '100',
		};
		const gamesUnderTest: FullGame[] = [
			...factory.getGames(5, { IsInstalled: 1 }),
			...factory.getGames(5, { IsInstalled: 0 }),
		];
		const otherGames: FullGame[] = factory.getGames(20);
		const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const vm = new HomePageViewModel({
			getPageData: () => data,
			gameStore: gameStore,
		});
		// Act
		const filteredGames = vm.games;
		// Assert
		expect(filteredGames).toHaveLength(games.length);
	});

	it('paginates game list', async () => {
		// Arrange
		const data: PageProps['data'] = {
			...defaultPageData,
			installed: true,
			notInstalled: true,
			page: '1',
			pageSize: '25',
		};
		const gamesUnderTest: FullGame[] = factory.getGames(30);
		const games: FullGame[] = testUtils.shuffleArray([...gamesUnderTest]);
		const gameIds = games.map((g) => g.Id);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const vm = new HomePageViewModel({
			getPageData: () => data,
			gameStore: gameStore,
		});
		// Act
		const paginatedGames = vm.games;
		const uniquePaginatedGames = new Set(paginatedGames?.map((g) => g.Id));
		// Assert
		expect(paginatedGames?.length).toBeLessThanOrEqual(Number(data.pageSize));
		expect(paginatedGames?.every((g) => gameIds.includes(g.Id)));
		expect(uniquePaginatedGames.size).toBe(paginatedGames?.length);
	});
});
