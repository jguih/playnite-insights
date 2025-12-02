import type { GamePageSize, GameSortBy, GameSortOrder } from '@playatlas/game-library/domain';
import type { homePageSearchParamsKeys } from './searchParams.constants';

export type HomePageSearchParamKeys =
	(typeof homePageSearchParamsKeys)[keyof typeof homePageSearchParamsKeys];

export type HomePageFilterParams = {
	query: string | null;
	installed: boolean;
	notInstalled: boolean;
	developers: string[];
	publishers: string[];
	genres: string[];
	platforms: string[];
};

export type HomePageSortingParams = {
	sortBy: GameSortBy;
	sortOrder: GameSortOrder;
};

export type HomePagePaginationParams = {
	pageSize: GamePageSize;
	page: number;
};
