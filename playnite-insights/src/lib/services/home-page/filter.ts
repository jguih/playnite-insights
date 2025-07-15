import type { ValidSortBy, ValidSortOrder } from './validation';

export type HomePageFilters = {
	query: string | null;
	installed: string | null;
};

export type HomePageSorting = {
	order: ValidSortOrder;
	by: ValidSortBy;
};

export const getWhereClauseAndParamsFromFilters = (filters?: HomePageFilters) => {
	const where: string[] = [];
	const params: string[] = [];

	if (!filters) {
		return { where: '', params };
	}

	if (filters.query !== null) {
		where.push(`LOWER(Name) LIKE ?`);
		params.push(`%${filters.query.toLowerCase()}%`);
	}

	if (filters.installed !== null && (filters.installed === '1' || filters.installed === '0')) {
		where.push(`IsInstalled = ?`);
		params.push(filters.installed);
	}

	if (where.length === 0) {
		return { where: '', params };
	}

	return { where: `WHERE ${where.join(' AND ')}`, params };
};

export const getOrderByClause = (sorting?: HomePageSorting): string => {
	if (!sorting) return ` ORDER BY Id ASC`;

	switch (sorting.by) {
		case 'IsInstalled': {
			return ` ORDER BY IsInstalled ${sorting.order.toUpperCase()}, Id ASC`;
		}
		case 'Id': {
			return ` ORDER BY Id ${sorting.order.toUpperCase()}`;
		}
		default:
			return ` ORDER BY Id ASC`;
	}
};
