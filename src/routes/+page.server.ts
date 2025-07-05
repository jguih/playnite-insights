import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const params = url.searchParams;
	let changed = false;

	if (!params.has('page')) {
		params.set('page', '1');
		changed = true;
	}

	if (!params.has('page_size')) {
		params.set('page_size', '50');
		changed = true;
	}

	if (changed) {
		throw redirect(302, `${url.pathname}?${params.toString()}`);
	}

	return;
};
