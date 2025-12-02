import { homePageSearchParamsKeys as paramKeys } from '$lib/client/page/home/searchParams.constants';
import { gamePageSizes, gameSortBy, gameSortOrder } from '@playatlas/game-library/domain';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const params = new URLSearchParams(url.searchParams);
	let changed = false;
	if (!params.has(paramKeys.page)) {
		params.set(paramKeys.page, '1');
		changed = true;
	}
	if (!params.has(paramKeys.pageSize)) {
		params.set(paramKeys.pageSize, String(gamePageSizes[gamePageSizes.length - 1]));
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
};
