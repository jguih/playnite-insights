import { getHomePagePlayniteGameList } from '$lib/playnite-game/playnite-game-repository';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';
import type { homePagePlayniteGameListSchema } from '../../../../lib/page/home/schemas';

export const GET: RequestHandler = ({ url }) => {
	const searchParams = url.searchParams;
	const page = Number(searchParams.get('page'));
	if (!Number.isInteger(page)) {
		return json({ message: 'page must be an integer' }, { status: 400 });
	}
	const pageSize = Number(searchParams.get('page_size'));
	if (!Number.isInteger(pageSize)) {
		return json({ message: 'page_size must an integer' }, { status: 400 });
	}
	const query = searchParams.get('query');
	const offset = (Number(page) - 1) * Number(pageSize);
	const data = getHomePagePlayniteGameList(offset, pageSize, query);
	if (!data) {
		return json(null, { status: 400 });
	}
	const responseData: z.infer<typeof homePagePlayniteGameListSchema> = {
		...data
	};
	return json(responseData);
};
