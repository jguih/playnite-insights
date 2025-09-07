import type { FullGame } from '@playnite-insights/lib/client';
import { FullGameFactory } from '@playnite-insights/testing';
import { describe, expect, it } from 'vitest';
import type { PageProps } from '../../../routes/$types';
import { HomePageViewModel } from './homePageViewModel.svelte';

const defaultPageData: PageProps['data'] = {
	appName: 'test',
	developers: [],
	genres: [],
	installed: false,
	notInstalled: false,
	offset: 0,
	page: '1',
	pageSize: '25',
	platforms: [],
	publishers: [],
	query: null,
	sortBy: 'LastActivity',
	sortOrder: 'desc',
};
const factory = new FullGameFactory();

describe('HomePageViewModel', () => {
	it.each([
		{ name: 'Grim Dawn' },
		{ name: 'Cyberpunk 2077' },
		{ name: 'Titanfall 2' },
		{ name: 'The Witcher 3' },
	])('filters by query', ({ name }) => {
		// Arrange
		const data: PageProps['data'] = {
			...defaultPageData,
			query: name.toLowerCase(),
		};
		const game: FullGame = factory.getGame({ Name: name });
		const games: FullGame[] = factory.getGames(20).map((g) => ({ ...g, Name: 'Other Game' }));
		games.push(game);
		const vm = new HomePageViewModel({
			getPageData: () => data,
			gameSignal: { raw: games },
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
});
