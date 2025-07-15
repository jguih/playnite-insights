import { homePageDataSchema, type HomePageData } from '@playnite-insights/lib/client/home-page';
import {
	gamePageSizes,
	type GamePageSize,
	type GamePageSizes
} from '@playnite-insights/lib/client/playnite-game';
import type { PageProps } from '../../../routes/$types';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';

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
		load
	};
};
