import {
	homePageDataSchema,
	type HomePageData,
	type HomePageGame,
	type HomePageSearchParamKeys
} from '@playnite-insights/lib/client/home-page';
import {
	gamePageSizes,
	type GamePageSize,
	type GamePageSizes,
	type GameSortBy,
	type GameSortOrder
} from '@playnite-insights/lib/client/playnite-game';
import type { PageProps } from '../../../routes/$types';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';
import { m } from '$lib/paraglide/messages';
import { ZodError } from 'zod';

export const makeHomePageViewModel = (data: PageProps['data']) => {
	let games: HomePageData;
	let isError: boolean = false;

	const getOffset = (): number => (Number(data.page) - 1) * Number(data.pageSize);
	const getTotalGamesCount = (): number => (games ? games.total : 0);
	const getGameCountFrom = (): number => getOffset();
	const getGameCountTo = (): number =>
		Math.min(Number(data.pageSize) + getOffset(), getTotalGamesCount());
	const getTotalPages = (): number => (games ? games.totalPages : 0);
	const getGameList = (): HomePageGame[] | undefined => games?.games;
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getPageSizeList = (): GamePageSizes => gamePageSizes;
	const getIsError = (): boolean => isError;

	const getSortOrderLabel = (sortOrder: GameSortOrder): string => {
		switch (sortOrder) {
			case 'asc':
				return m.option_sort_ascending();
			case 'desc':
				return m.option_sort_descending();
		}
	};

	const getSortByLabel = (sortBy: GameSortBy): string => {
		switch (sortBy) {
			case 'Id':
				return m.option_sortby_id();
			case 'IsInstalled':
				return m.option_sortby_is_installed();
			case 'Added':
				return m.option_sortby_added();
			case 'LastActivity':
				return m.option_sortby_last_activity();
			case 'Playtime':
				return m.option_sortby_playtime();
			default:
				return sortBy;
		}
	};

	const load = async () => {
		try {
			const response = await data.promise;
			const result = homePageDataSchema.parse(await response.json());
			games = result;
			isError = false;
		} catch (error) {
			isError = true;
			if (error && error instanceof ZodError) {
				console.error(error.format());
				return;
			}
			console.error(error);
		}
	};

	return {
		getOffset,
		getTotalGamesCount,
		getGameCountFrom,
		getGameCountTo,
		getTotalPages,
		getGameList,
		getImageURL,
		getPageSizeList,
		getIsError,
		getSortOrderLabel,
		getSortByLabel,
		load
	};
};
