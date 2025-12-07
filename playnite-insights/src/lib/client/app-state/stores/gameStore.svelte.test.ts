import type { GameResponseDto } from '@playatlas/game-library/dtos';
import { makeMocks, testUtils } from '@playnite-insights/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { factory } from '../../../../vitest.unit-testing.setup';
import { GameStore } from './gameStore.svelte';

const mocks = makeMocks();
const fetchClient = mocks.fetchClient;
let gameStore = new GameStore({ httpClient: fetchClient });

describe('HomePageViewModel', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		gameStore = new GameStore({ httpClient: fetchClient });
	});

	it.each([
		{ name: 'Grim Dawn', query: 'grim' },
		{ name: 'Grim Dawn', query: 'dawn' },
		{ name: 'Cyberpunk 2077', query: 'cyberpunk' },
		{ name: 'Titanfall 2', query: 'TitanfaLL 2' },
		{ name: 'The Witcher 3', query: 'wItChEr 3' },
	])('filters by query: $query', async ({ name, query }) => {
		// Arrange
		const game: GameResponseDto = factory.getGameFactory().buildDto({ name });
		const games: GameResponseDto[] = factory
			.getGameFactory()
			.buildDtoList(20, { name: 'Other Game' });
		games.push(game);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const storeGames = gameStore.dataSignal.raw ?? [];
		// Act
		const filteredGames = gameStore.applyFilters(storeGames, { query });
		const filteredGamesIds = filteredGames?.map((g) => g.Id);
		// Assert
		expect(filteredGames).toBeTruthy();
		expect(filteredGamesIds).toBeTruthy();
		expect(filteredGames).toHaveLength(1);
		expect(filteredGamesIds).toContain(game.Id);
	});

	it('when filtering by query, returns all games if query is null', async () => {
		// Arrange
		const gamesCount = 20;
		const games: GameResponseDto[] = factory.getGameFactory().buildDtoList(gamesCount);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const storeGames = gameStore.dataSignal.raw ?? [];
		// Act
		const filteredGames = gameStore.applyFilters(storeGames, { query: null });
		// Assert
		expect(filteredGames).toBeTruthy();
		expect(filteredGames).toHaveLength(gamesCount);
	});

	it.each([{ isInstalled: true }, { isInstalled: false }])(
		'filters by installation status: $installed',
		async ({ isInstalled }) => {
			// Arrange
			const gamesCount = 20;
			const gameUnderTest: GameResponseDto = factory.getGameFactory().buildDto({ isInstalled });
			const games: GameResponseDto[] = factory
				.getGameFactory()
				.buildDtoList(gamesCount, { isInstalled: !isInstalled });
			games.push(gameUnderTest);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const storeGames = gameStore.dataSignal.raw ?? [];
			// Act
			const filteredGames = gameStore.applyFilters(storeGames, {
				isInstalled: isInstalled,
				isNotInstalled: !isInstalled,
			});
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
			const gamesUnderTest: GameResponseDto[] =
				gameDeveloperIds.length === 1
					? factory.getGameFactory().buildDtoList(5, { developerIds: [gameDeveloperIds[0]] })
					: [
							...factory.getGameFactory().buildDtoList(2, { developerIds: [gameDeveloperIds[0]] }),
							...factory.getGameFactory().buildDtoList(2, { developerIds: [gameDeveloperIds[1]] }),
							factory.getGameFactory().buildDto({ developerIds: gameDeveloperIds }),
						];
			const otherGames: GameResponseDto[] = factory.getGameFactory().buildDtoList(20, {
				developerIds: ['dev1', 'dev2', 'dev3', 'dev4'],
			});
			const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const storeGames = gameStore.dataSignal.raw ?? [];
			// Act
			const filteredGames = gameStore.applyFilters(storeGames, {
				developerIds: filterDeveloperIds,
			});
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
			const gamesUnderTest: GameResponseDto[] =
				gamePublisherIds.length === 1
					? factory.getGameFactory().buildDtoList(5, { publisherIds: [gamePublisherIds[0]] })
					: [
							...factory.getGameFactory().buildDtoList(2, { publisherIds: [gamePublisherIds[0]] }),
							...factory.getGameFactory().buildDtoList(2, { publisherIds: [gamePublisherIds[1]] }),
							factory.getGameFactory().buildDto({ publisherIds: gamePublisherIds }),
						];
			const otherGames: GameResponseDto[] = factory.getGameFactory().buildDtoList(20, {
				publisherIds: ['pub1', 'pub2', 'pub3'],
			});
			const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const storeGames = gameStore.dataSignal.raw ?? [];
			// Act
			const filteredGames = gameStore.applyFilters(storeGames, {
				publisherIds: filterPublisherIds,
			});
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
			const gamesUnderTest: GameResponseDto[] =
				gamePlatformIds.length === 1
					? factory.getGameFactory().buildDtoList(5, { platformIds: [gamePlatformIds[0]] })
					: [
							...factory.getGameFactory().buildDtoList(2, { platformIds: [gamePlatformIds[0]] }),
							...factory.getGameFactory().buildDtoList(2, { platformIds: [gamePlatformIds[1]] }),
							factory.getGameFactory().buildDto({ platformIds: gamePlatformIds }),
						];
			const otherGames: GameResponseDto[] = factory.getGameFactory().buildDtoList(20, {
				platformIds: ['plat1', 'plat2', 'plat3'],
			});
			const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
			fetchClient.httpGetAsync.mockResolvedValueOnce(games);
			await gameStore.loadGames();
			const storeGames = gameStore.dataSignal.raw ?? [];
			// Act
			const filteredGames = gameStore.applyFilters(storeGames, { platformIds: filterPlatformIds });
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
		const gamesUnderTest: GameResponseDto[] =
			gameGenreIds.length === 1
				? factory.getGameFactory().buildDtoList(5, { genreIds: [gameGenreIds[0]] })
				: [
						...factory.getGameFactory().buildDtoList(2, { genreIds: [gameGenreIds[0]] }),
						...factory.getGameFactory().buildDtoList(2, { genreIds: [gameGenreIds[1]] }),
						factory.getGameFactory().buildDto({ genreIds: gameGenreIds }),
					];
		const otherGames: GameResponseDto[] = factory.getGameFactory().buildDtoList(20, {
			genreIds: ['genre1', 'genre2', 'genre3'],
		});
		const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const storeGames = gameStore.dataSignal.raw ?? [];
		// Act
		const filteredGames = gameStore.applyFilters(storeGames, {
			genreIds: filterGenreIds,
		});
		// Assert
		expect(filteredGames).toHaveLength(expectedMatch);
		expect(
			filterGenreIds.length === 0 ||
				filteredGames?.every((g) => g.Genres.some((d) => filterGenreIds.includes(d))),
		).toBe(true);
	});

	it('returns all games if filtering by installed and not installed', async () => {
		// Arrange
		const gamesUnderTest: GameResponseDto[] = [
			...factory.getGameFactory().buildDtoList(5, { isInstalled: true }),
			...factory.getGameFactory().buildDtoList(5, { isInstalled: false }),
		];
		const otherGames: GameResponseDto[] = factory.getGameFactory().buildDtoList(20);
		const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest, ...otherGames]);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const storeGames = gameStore.dataSignal.raw ?? [];
		// Act
		const filteredGames = gameStore.applyFilters(storeGames, {
			isInstalled: true,
			isNotInstalled: true,
		});
		// Assert
		expect(filteredGames).toHaveLength(games.length);
	});

	it('paginates game list', async () => {
		// Arrange
		const gamesUnderTest: GameResponseDto[] = factory.getGameFactory().buildDtoList(30);
		const games: GameResponseDto[] = testUtils.shuffleArray([...gamesUnderTest]);
		const gameIds = games.map((g) => g.Id);
		fetchClient.httpGetAsync.mockResolvedValueOnce(games);
		await gameStore.loadGames();
		const storeGames = gameStore.dataSignal.raw ?? [];
		// Act
		const paginatedGames = gameStore.applyPagination(storeGames, { page: 1, pageSize: 25 });
		const uniquePaginatedGames = new Set(paginatedGames?.map((g) => g.Id));
		// Assert
		expect(paginatedGames?.length).toBeLessThanOrEqual(25);
		expect(paginatedGames?.every((g) => gameIds.includes(g.Id)));
		expect(uniquePaginatedGames.size).toBe(paginatedGames?.length);
	});
});
