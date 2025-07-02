import { getGameList } from '$lib/services/game-repository';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
	const games = await getGameList();
	const total = games.length;
	const installed = games.filter((g) => g.IsInstalled).length;
	const notInstalled = games.length - installed;
	const totalPlayTime = (
		games.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600
	).toFixed(2);
	const notPlayed = games.filter((g) => g.Playtime === 0).length;
	const played = games.length - notPlayed;

	return {
		games,
		total,
		installed,
		notInstalled,
		totalPlayTime,
		notPlayed,
		played
	};
};
