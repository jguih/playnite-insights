import { m } from '$lib/paraglide/messages';
import type { FullGame } from '@playnite-insights/lib/client';
import type { CompanySignal } from '../app-state/AppData.types';
import type { GameStore } from '../app-state/stores/gameStore.svelte';
import { getPlayniteGameImageUrl, getPlaytimeInHoursAndMinutes } from '../utils/playnite-game';

type GamePageViewModelProps = {
	getGameId: () => string | null;
	gameStore: GameStore;
	companySignal: CompanySignal;
};

export class GamePageViewModel {
	#getGameId: GamePageViewModelProps['getGameId'];
	#gameStore: GamePageViewModelProps['gameStore'];
	#companySignal: GamePageViewModelProps['companySignal'];
	#game: FullGame | null;

	constructor({ getGameId, gameStore, companySignal }: GamePageViewModelProps) {
		this.#getGameId = getGameId;
		this.#gameStore = gameStore;
		this.#companySignal = companySignal;

		this.#game = $derived.by(() => {
			const gameId = this.#getGameId();
			if (!gameId) return null;
			const gameList = this.#gameStore.gameList ?? [];
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
		return getPlaytimeInHoursAndMinutes(this.#game?.Playtime ?? 0);
	};

	getDevelopers = (): string => {
		const companies = this.#companySignal.raw;
		if (!this.#game || !companies) return '';
		const fullDevs = companies.filter((dev) => this.#game?.Developers.includes(dev.Id));
		return fullDevs.map((d) => d.Name).join(', ');
	};
}
