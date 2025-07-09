import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		appName: process.env.APP_NAME
	};
};
