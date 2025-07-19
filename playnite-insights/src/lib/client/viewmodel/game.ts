import { m } from '$lib/paraglide/messages';
import { type FullGame } from '@playnite-insights/lib/client/playnite-game';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';
import type { Company } from '@playnite-insights/lib/client/company';

export const makeGamePageViewModel = (game?: FullGame, companies?: Company[]) => {
	const getGame = (): FullGame | undefined => game;
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getDevelopers = (): string => {
		if (!game || !companies) return '';
		const fullDevs = companies.filter((dev) => game.Developers.includes(dev.Id));
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
