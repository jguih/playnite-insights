import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const promise = fetch(`/api/dash`);
	return { promise };
};
