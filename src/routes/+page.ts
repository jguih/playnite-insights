import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const params = url.searchParams;
	let changed = false;

	if (!params.has('page')) {
		params.set('page', '1');
		changed = true;
	}

	if (!params.has('page_size')) {
		params.set('page_size', '100');
		changed = true;
	}

	if (changed) {
		throw redirect(302, `${url.pathname}?${params.toString()}`);
	}

	const promise = fetch(`/api/home?${params.toString()}`);
	return {
		promise,
		pageSize: Number(params.get('page_size')),
		query: params.get('query'),
		page: Number(params.get('page'))
	};
};
