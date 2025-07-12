import { m } from '$lib/paraglide/messages';
import { gamePageDataSchema, type GamePageData } from '$lib/services/game-page/schemas';
import type { PlayniteGame } from '$lib/services/playnite-game/schemas';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';

export const makeGamePageViewModel = (promise: Promise<Response>) => {
	let pageData: GamePageData | undefined;
	let isError: boolean = false;

	const getGame = (): PlayniteGame | undefined => pageData?.game;
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getDevelopers = (): string => {
		return pageData?.game?.Developers?.map((dev) => dev.Name).join(', ') ?? '';
	};
	const getPlaytime = (): string => {
		if (pageData?.game?.Playtime && pageData.game.Playtime > 0) {
			const playtime = pageData.game.Playtime; // In seconds
			const totalMins = Math.floor(playtime / 60);
			const hours = Math.floor(totalMins / 60);
			const mins = totalMins % 60;
			return m.game_playtime_in_hours_and_minutes({ hours: hours, mins: mins });
		}
		return m.game_playtime_in_hours_and_minutes({ hours: 0, mins: 0 });
	};
	const getAdded = (): string => {
		if (pageData?.game?.Added) {
			return new Date(pageData.game.Added).toLocaleDateString();
		}
		return '';
	};
	const getReleaseDate = (): string => {
		if (pageData?.game?.ReleaseDate) {
			return new Date(pageData.game.ReleaseDate).toLocaleDateString();
		}
		return '';
	};
	const getInstalled = (): string => {
		if (pageData?.game?.IsInstalled) {
			return m.yes();
		}
		return m.no();
	};
	const getIsError = (): boolean => isError;

	const load = async () => {
		try {
			const response = await promise;
			const data = gamePageDataSchema.parse(await response.json());
			pageData = data;
			isError = false;
		} catch (error) {
			isError = true;
			console.error(error);
		}
	};

	return {
		getGame,
		getImageURL,
		getDevelopers,
		getPlaytime,
		getAdded,
		getReleaseDate,
		getInstalled,
		load,
		getIsError
	};
};
