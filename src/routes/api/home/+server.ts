import { json, type RequestHandler } from '@sveltejs/kit';
import { services } from '$lib';
import type { HomePageFilters } from '$lib/services/home-page/filter';

export const GET: RequestHandler = ({ url }) => {
	const searchParams = url.searchParams;
	const page = Number(searchParams.get('page'));
	if (!Number.isInteger(page) || page < 0) {
		return json({ message: 'page must be an integer greater than or equal to 0' }, { status: 400 });
	}
	const pageSize = Number(searchParams.get('page_size'));
	if (!Number.isInteger(pageSize) || pageSize <= 0) {
		return json({ message: 'page_size must an integer greater than 0' }, { status: 400 });
	}
	const offset = (Number(page) - 1) * Number(pageSize);
	const query = searchParams.get('query');
	const installed = searchParams.get('installed') === '1';
	const notInstalled = searchParams.get('notInstalled') === '1';
	const filters: HomePageFilters = {
		query: query,
		installed: installed && !notInstalled ? '1' : notInstalled && !installed ? '0' : null
	};
	const data = services.homePage.getGames(offset, pageSize, filters);
	if (!data) {
		return json(null, { status: 400 });
	}
	return json({ ...data });
};
