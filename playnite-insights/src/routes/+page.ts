import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	parseSearchParams,
	searchParamsKeys,
	validPageSizes,
	validSortBy,
	validSortOrder
} from '$lib/services/home-page/validation';

export const load: PageLoad = async ({ url, fetch }) => {
	const params = new URLSearchParams(url.searchParams);
	let changed = false;
	if (!params.has(searchParamsKeys.page)) {
		params.set(searchParamsKeys.page, '1');
		changed = true;
	}
	if (!params.has(searchParamsKeys.pageSize)) {
		params.set(searchParamsKeys.pageSize, validPageSizes[validPageSizes.length - 1]);
		changed = true;
	}
	if (!params.has(searchParamsKeys.sortOrder)) {
		params.set(searchParamsKeys.sortOrder, validSortOrder[0]);
		changed = true;
	}
	if (!params.has(searchParamsKeys.sortBy)) {
		params.set(searchParamsKeys.sortBy, validSortBy[0]);
		changed = true;
	}
	if (changed) {
		throw redirect(302, `${url.pathname}?${params.toString()}`);
	}
	const parsedValues = parseSearchParams(params);

	const promise = fetch(`/api/home?${params.toString()}`);
	return {
		promise,
		...parsedValues
	};
};
