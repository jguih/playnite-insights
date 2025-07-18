import { services } from '$lib';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const devs = services.developerRepository.all();
	return { developers: devs };
};
