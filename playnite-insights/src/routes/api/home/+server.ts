import { json, type RequestHandler } from '@sveltejs/kit';
import { services } from '$lib';
import { type HomePageFilters, type HomePageSorting } from '$lib/services/home-page/filter';
import { parseSearchParams } from '$lib/services/home-page/validation';

export const GET: RequestHandler = ({ url }) => {
	const searchParams = url.searchParams;
	const { pageSize, offset, sortBy, sortOrder, query, installed, notInstalled } =
		parseSearchParams(searchParams);
	const filters: HomePageFilters = {
		query: query,
		installed: installed && !notInstalled ? '1' : notInstalled && !installed ? '0' : null
	};
	const sorting: HomePageSorting = {
		by: sortBy,
		order: sortOrder
	};
	const data = services.homePage.getGames(offset, Number(pageSize), filters, sorting);
	if (!data) {
		return json(null, { status: 400 });
	}
	return json({ ...data });
};
