import { homePageDataSchema, type HomePageData } from '@playnite-insights/lib/client/home-page';
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

export const makeHomePageViewModel = ({ data }: PageProps) => {
	let pageData: HomePageData | undefined;
	let isError: boolean = false;

	const getPage = (): string => data.page;
	const getPageSize = (): GamePageSize => data.pageSize;
	const getQuery = (): string | null => data.query;
	const getOffset = (): number => (Number(data.page) - 1) * Number(data.pageSize);
	const getTotalGamesCount = (): number => (pageData ? pageData.total : 0);
	const getGameCountFrom = (): number => getOffset();
	const getGameCountTo = (): number =>
		Math.min(Number(data.pageSize) + getOffset(), getTotalGamesCount());
	const getTotalPages = (): number => (pageData ? pageData.totalPages : 0);
	const getGameList = (): HomePageData['games'] => (pageData ? pageData.games : []);
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
		}
	};

	const load = async () => {
		try {
			const response = await data.promise;
			const result = homePageDataSchema.parse(await response.json());
			pageData = result;
			isError = false;
		} catch (error) {
			isError = true;
			console.error(error);
		}
	};

	return {
		getPage,
		getPageSize,
		getQuery,
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
