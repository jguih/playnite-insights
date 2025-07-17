import { json, type RequestHandler } from '@sveltejs/kit';
import { services } from '$lib';
import {
	parseHomePageSearchParams,
	type GameFilters,
	type GameSorting
} from '@playnite-insights/lib';

export const GET: RequestHandler = ({ url }) => {
	const searchParams = url.searchParams;
	const { pageSize, offset, sortBy, sortOrder, query, installed, notInstalled } =
		parseHomePageSearchParams(searchParams);
	const filters: GameFilters = {
		query: query,
		installed: installed && !notInstalled ? '1' : notInstalled && !installed ? '0' : null
	};
	const sorting: GameSorting = {
		by: sortBy,
		order: sortOrder
	};
	const data = services.homePage.getData(offset, pageSize, filters, sorting);
	if (!data) {
		return json(null, { status: 400 });
	}
	return json({ ...data });
};
