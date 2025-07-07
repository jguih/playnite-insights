import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { dashPageDataSchema } from '$lib/services/dashboard-page/schemas';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`/api/dash`);
		const pageData = dashPageDataSchema.parse(await response.json());
		return pageData;
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to get dashboard data');
	}
};
