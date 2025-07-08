import { homePageDataSchema, type HomePageData } from '$lib/services/home-page/schemas';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';

export const makeHomePageViewModel = (
	promise: Promise<Response>,
	page: number,
	pageSize: number,
	query: string | null
) => {
	let pageData: HomePageData | undefined;

	const getPage = (): number => page;
	const getPageSize = (): number => pageSize;
	const getQuery = (): string | null => query;
	const getOffset = (): number => (page - 1) * pageSize;
	const getTotalGamesCount = (): number => (pageData ? pageData.total : 0);
	const getGameCountFrom = (): number => getOffset();
	const getGameCountTo = (): number => Math.min(pageSize + getOffset(), getTotalGamesCount());
	const getTotalPages = (): number => (pageData ? pageData.totalPages : 0);
	const getGameList = (): HomePageData['games'] => (pageData ? pageData.games : []);
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getPageSizeList = (): number[] => [2, 25, 50, 75, 100];

	const load = async () => {
		try {
			const response = await promise;
			const data = homePageDataSchema.parse(await response.json());
			pageData = data;
		} catch {
			return;
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
		load
	};
};
