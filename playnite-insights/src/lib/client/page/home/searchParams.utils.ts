import {
	gamePageSizes,
	gameSortBy,
	gameSortOrder,
	type GamePageSize,
	type GameSortBy,
	type GameSortOrder,
} from '@playatlas/game-library/domain';
import { homePageSearchParamsKeys } from './searchParams.constants';
import type {
	HomePageFilterParams,
	HomePagePaginationParams,
	HomePageSortingParams,
} from './searchParams.types';

export const isValidPage = (value?: number | null): value is number => {
	if (!value) return false;
	return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
};

export const isValidGameSortBy = (value: string | null): value is GameSortBy => {
	return gameSortBy.includes(value as GameSortBy);
};

export const isValidGameSortOrder = (value: string | null): value is GameSortOrder => {
	return gameSortOrder.includes(value as GameSortOrder);
};

export const isValidGamePageSize = (value?: string | number | null): value is GamePageSize => {
	if (!value) return false;
	return (
		Number.isFinite(Number(value)) &&
		Number.isInteger(Number(value)) &&
		gamePageSizes.includes(Number(value) as GamePageSize)
	);
};

export type HomePageSearchParams = {
	pagination: HomePagePaginationParams;
	filter: HomePageFilterParams;
	sorting: HomePageSortingParams;
};

export const parseHomePageSearchParams = (params: URLSearchParams): HomePageSearchParams => {
	// Pagination
	const _pageSize = params.get(homePageSearchParamsKeys.pageSize);
	const pageSize: GamePageSize = isValidGamePageSize(_pageSize) ? _pageSize : 100;
	const _page = params.get(homePageSearchParamsKeys.page);
	const _page_as_number = Number(_page);
	const page: number = isValidPage(_page_as_number) ? _page_as_number : 1;
	// Filtering
	const query = params.get(homePageSearchParamsKeys.query);
	const installed = params.get(homePageSearchParamsKeys.installed) === '1';
	const notInstalled = params.get(homePageSearchParamsKeys.notInstalled) === '1';
	const developers = params.getAll(homePageSearchParamsKeys.developer);
	const publishers = params.getAll(homePageSearchParamsKeys.publisher);
	const genres = params.getAll(homePageSearchParamsKeys.genre);
	const platforms = params.getAll(homePageSearchParamsKeys.platform);
	// Sorting
	const _sortBy = params.get(homePageSearchParamsKeys.sortBy);
	const sortBy: GameSortBy = isValidGameSortBy(_sortBy) ? _sortBy : gameSortBy[0];
	const _sortOrder = params.get(homePageSearchParamsKeys.sortOrder);
	const sortOrder: GameSortOrder = isValidGameSortOrder(_sortOrder) ? _sortOrder : 'asc';

	return {
		pagination: { pageSize, page },
		filter: {
			query,
			installed,
			notInstalled,
			developers,
			publishers,
			genres,
			platforms,
		},
		sorting: { sortBy, sortOrder },
	};
};
