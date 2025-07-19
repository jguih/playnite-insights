import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	homePageSearchParamsKeys as paramKeys,
	parseHomePageSearchParams
} from '@playnite-insights/lib/client/home-page';
import {
	gamePageSizes,
	gameSortBy,
	gameSortOrder
} from '@playnite-insights/lib/client/playnite-game';

export const load: PageLoad = ({ url, fetch }) => {
	const params = new URLSearchParams(url.searchParams);
	let changed = false;
	if (!params.has(paramKeys.page)) {
		params.set(paramKeys.page, '1');
		changed = true;
	}
	if (!params.has(paramKeys.pageSize)) {
		params.set(paramKeys.pageSize, gamePageSizes[gamePageSizes.length - 1]);
		changed = true;
	}
	if (!params.has(paramKeys.sortOrder)) {
		params.set(paramKeys.sortOrder, gameSortOrder[0]);
		changed = true;
	}
	if (!params.has(paramKeys.sortBy)) {
		params.set(paramKeys.sortBy, gameSortBy[0]);
		changed = true;
	}
	if (changed) {
		throw redirect(302, `${url.pathname}?${params.toString()}`);
	}
	const parsedValues = parseHomePageSearchParams(params);

	return {
		...parsedValues
	};
};
