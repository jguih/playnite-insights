import type { FullGame } from '@playnite-insights/lib/client/playnite-game';
import type { CompanySignal, GamesSignal } from '../app-state/AppData.types';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';
import { m } from '$lib/paraglide/messages';

type GamePageViewModelProps = {
	getGameId: () => string;
	gamesSignal: GamesSignal;
	companySignal: CompanySignal;
};

export class GamePageViewModel {
	#getGameId: GamePageViewModelProps['getGameId'];
	#gamesSignal: GamePageViewModelProps['gamesSignal'];
	#companySignal: GamePageViewModelProps['companySignal'];
	#game: FullGame | null;

	constructor({ getGameId, gamesSignal, companySignal }: GamePageViewModelProps) {
		this.#getGameId = getGameId;
		this.#gamesSignal = gamesSignal;
		this.#companySignal = companySignal;

		this.#game = $derived.by(() => {
			const gameId = this.#getGameId();
			const gameList = this.#gamesSignal.raw ? this.#gamesSignal.raw : [];
			return gameList?.find((g) => g.Id === gameId) ?? null;
		});
	}

	get game() {
		return this.#game;
	}

	getBackgroundImageUrl = (): string => {
		return getPlayniteGameImageUrl(this.#game?.BackgroundImage);
	};

	getIconImageUrl = (): string => {
		return getPlayniteGameImageUrl(this.#game?.Icon);
	};

	getReleaseDate = (): string => {
		if (this.#game?.ReleaseDate) {
			return new Date(this.#game.ReleaseDate).toLocaleDateString();
		}
		return '';
	};

	getInstalled = (): string => {
		if (this.#game?.IsInstalled) {
			return m.yes();
		}
		return m.no();
	};

	getAdded = (): string => {
		if (this.#game?.Added) {
			return new Date(this.#game.Added).toLocaleDateString();
		}
		return '';
	};

	getPlaytime = (): string => {
		if (this.#game?.Playtime && this.#game.Playtime > 0) {
			const playtime = this.#game.Playtime; // In seconds
			const totalMins = Math.floor(playtime / 60);
			const hours = Math.floor(totalMins / 60);
			const mins = totalMins % 60;
			return m.game_playtime_in_hours_and_minutes({ hours: hours, mins: mins });
		}
		return m.game_playtime_in_hours_and_minutes({ hours: 0, mins: 0 });
	};

	getDevelopers = (): string => {
		const companies = this.#companySignal.raw;
		if (!this.#game || !companies) return '';
		const fullDevs = companies.filter((dev) => this.#game?.Developers.includes(dev.Id));
		return fullDevs.map((d) => d.Name).join(', ');
	};
}
