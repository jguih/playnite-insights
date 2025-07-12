export type HomePageFilters = {
	query: string | null;
	installed: string | null;
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
