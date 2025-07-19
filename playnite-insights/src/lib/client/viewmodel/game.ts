import { m } from '$lib/paraglide/messages';
import { type FullGame } from '@playnite-insights/lib/client/playnite-game';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';
import type { Developer } from '@playnite-insights/lib/client/developer';

export const makeGamePageViewModel = (game?: FullGame, devs?: Developer[]) => {
	const getGame = (): FullGame | undefined => game;
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getDevelopers = (): string => {
		if (!game || !game.Developers || !devs) return '';
		const gameDevs = game.Developers.split(',').sort();
		const fullDevs = devs.filter((dev) => gameDevs.includes(dev.Id));
		return fullDevs.map((d) => d.Name).join(', ');
	};
	const getPlaytime = (): string => {
		if (game?.Playtime && game.Playtime > 0) {
			const playtime = game.Playtime; // In seconds
			const totalMins = Math.floor(playtime / 60);
			const hours = Math.floor(totalMins / 60);
			const mins = totalMins % 60;
			return m.game_playtime_in_hours_and_minutes({ hours: hours, mins: mins });
		}
		return m.game_playtime_in_hours_and_minutes({ hours: 0, mins: 0 });
	};
	const getAdded = (): string => {
		if (game?.Added) {
			return new Date(game.Added).toLocaleDateString();
		}
		return '';
	};
	const getReleaseDate = (): string => {
		if (game?.ReleaseDate) {
			return new Date(game.ReleaseDate).toLocaleDateString();
		}
		return '';
	};
	const getInstalled = (): string => {
		if (game?.IsInstalled) {
			return m.yes();
		}
		return m.no();
	};

	return {
		getGame,
		getImageURL,
		getDevelopers,
		getPlaytime,
		getAdded,
		getReleaseDate,
		getInstalled
	};
};
