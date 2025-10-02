import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	const appName = process.env.PLAYATLAS_INSTANCE_NAME;

	return {
		appName,
	};
};
