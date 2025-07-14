export const searchParamsKeys = {
	page: 'page',
	pageSize: 'pageSize',
	query: 'query',
	sortBy: 'sortBy',
	sortOrder: 'sortOrder',
	installed: 'installed',
	notInstalled: 'notInstalled'
} as const;
export type ValidSearchParamKeys = (typeof searchParamsKeys)[keyof typeof searchParamsKeys];

export const validSortBy = ['Id', 'IsInstalled'] as const;
export type ValidSortBy = (typeof validSortBy)[number];
export const isValidSortBy = (value: string | null): value is ValidSortBy => {
	return validSortBy.includes(value as ValidSortBy);
};
export const getSortByLabel = (value: ValidSortBy): string => {
	switch (value) {
		case 'Id':
			return 'Id';
		case 'IsInstalled':
			return 'Is Installed';
	}
};

export const validSortOrder = ['asc', 'desc'] as const;
export type ValidSortOrder = (typeof validSortOrder)[number];
export const isValidSortOrder = (value: string | null): value is ValidSortOrder => {
	return validSortOrder.includes(value as ValidSortOrder);
};
export const getSortOrderLabel = (value: ValidSortOrder): string => {
	switch (value) {
		case 'asc':
			return 'Ascending';
		case 'desc':
			return 'Descending';
	}
};

export const validPageSizes = ['25', '50', '75', '100'] as const;
export type ValidPageSizes = typeof validPageSizes;
export const isValidPageSize = (value: string | null): value is ValidPageSizes[number] => {
	if (!value) return false;
	return (
		Number.isFinite(Number(value)) &&
		Number.isInteger(Number(value)) &&
		validPageSizes.includes(value as ValidPageSizes[number])
	);
};
export const isValidPage = (value: string | null) => {
	if (!value) return true;
	return Number.isFinite(Number(value)) && Number.isInteger(Number(value)) && Number(value) >= 0;
};

export const parseSearchParams = (params: URLSearchParams) => {
	// Pagination
	const _pageSize = params.get(searchParamsKeys.pageSize);
	const pageSize: ValidPageSizes[number] = isValidPageSize(_pageSize) ? _pageSize : '100';
	const _page = params.get(searchParamsKeys.page);
	const page: string = _page && isValidPage(_page) ? _page : '1';
	const offset: number = (Number(page) - 1) * Number(pageSize);
	// Filtering
	const query = params.get(searchParamsKeys.query);
	const installed = params.get(searchParamsKeys.installed) === '1';
	const notInstalled = params.get(searchParamsKeys.notInstalled) === '1';
	// Sorting
	const _sortBy = params.get(searchParamsKeys.sortBy);
	const sortBy: ValidSortBy = isValidSortBy(_sortBy) ? _sortBy : 'Id';
	const _sortOrder = params.get(searchParamsKeys.sortOrder);
	const sortOrder: ValidSortOrder = isValidSortOrder(_sortOrder) ? _sortOrder : 'asc';

	return {
		pageSize,
		page,
		offset,
		query,
		installed,
		notInstalled,
		sortBy,
		sortOrder
	};
};
