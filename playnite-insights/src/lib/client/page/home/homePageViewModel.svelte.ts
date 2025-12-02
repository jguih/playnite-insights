import type { GameStore } from '$lib/client/app-state/stores/gameStore.svelte';
import { getPlayniteGameImageUrl } from '$lib/client/utils/playnite-game';
import { m } from '$lib/paraglide/messages';
import { gamePageSizes, type GameSortBy, type GameSortOrder } from '@playatlas/game-library/domain';
import type { HomePageSearchParams } from './searchParams.utils';

export type HomePageViewModelDeps = {
	gameStore: GameStore;
	getPageParams: () => HomePageSearchParams;
};

export class HomePageViewModel {
	#gameStore: HomePageViewModelDeps['gameStore'];
	#filtersCount: number;
	#paginationSequenceSignal: (number | null)[];

	constructor({ gameStore, getPageParams }: HomePageViewModelDeps) {
		this.#gameStore = gameStore;

		this.#filtersCount = $derived.by(() => {
			let counter = 0;
			for (const filter of Object.values(getPageParams().filter)) {
				if (filter === null) continue;
				if (typeof filter === 'string' || typeof filter === 'number') {
					counter++;
					continue;
				}
				if (typeof filter === 'boolean') {
					if (filter === true) counter++;
					continue;
				}
				if (filter.length > 0) {
					counter++;
					continue;
				}
			}
			return counter;
		});

		this.#paginationSequenceSignal = $derived.by(() => {
			const pageParams = getPageParams();
			return this.getPaginationSequence(
				Number(pageParams.pagination.page),
				this.#gameStore.gamesSignal?.totalPages ?? 1,
			);
		});
	}

	getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);

	getSortOrderLabel = (sortOrder: GameSortOrder): string => {
		switch (sortOrder) {
			case 'asc':
				return m.option_sort_ascending();
			case 'desc':
				return m.option_sort_descending();
		}
	};

	getSortByLabel = (sortBy: GameSortBy): string => {
		switch (sortBy) {
			case 'IsInstalled':
				return m.option_sortby_is_installed();
			case 'Added':
				return m.option_sortby_added();
			case 'LastActivity':
				return m.option_sortby_last_activity();
			case 'Playtime':
				return m.option_sortby_playtime();
			default:
				return sortBy;
		}
	};

	getPaginationSequence = (currentPage: number, totalPages: number) => {
		const delta = 1; // how many pages to show around current
		const range: (number | null)[] = [];

		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 || // always first
				i === totalPages || // always last
				(i >= currentPage - delta && i <= currentPage + delta) // neighbors
			) {
				range.push(i);
			} else if (range.at(-1) !== null) {
				range.push(null); // ellipsis marker
			}
		}

		return range;
	};

	get gamesSignal() {
		return this.#gameStore.gamesSignal;
	}

	get pageSizes() {
		return gamePageSizes;
	}

	get isLoading() {
		return !this.#gameStore.hasLoaded;
	}

	get filtersCount() {
		return this.#filtersCount;
	}

	get paginationSequenceSignal() {
		return this.#paginationSequenceSignal;
	}
}
