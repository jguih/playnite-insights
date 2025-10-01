import { m } from '$lib/paraglide/messages';
import {
	gamePageSizes,
	parseHomePageSearchParams,
	type GameSortBy,
	type GameSortOrder,
} from '@playnite-insights/lib/client';
import type { GameStore, GameStoreCacheItem } from '../app-state/stores/gameStore.svelte';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';

export type HomePageViewModelProps = {
	getPageSearchParams: () => URLSearchParams;
	gameStore: GameStore;
};

export class HomePageViewModel {
	#gameStore: HomePageViewModelProps['gameStore'];
	#filtersCount: number;
	#gamesCacheItem: GameStoreCacheItem;
	#pageParams: ReturnType<typeof parseHomePageSearchParams>;

	constructor({ getPageSearchParams, gameStore }: HomePageViewModelProps) {
		this.#gameStore = gameStore;

		this.#filtersCount = $derived.by(() => {
			let counter = 0;
			for (const filter of Object.values(this.pageParams.filter)) {
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

		this.#gamesCacheItem = $derived.by(() => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const _ = gameStore.gameList;
			const searchParams = getPageSearchParams();
			return gameStore.getfilteredGames(searchParams);
		});

		this.#pageParams = $derived.by(() => {
			const params = getPageSearchParams();
			return parseHomePageSearchParams(params);
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

	get gamesCacheItem() {
		return this.#gamesCacheItem;
	}

	get pageSizes() {
		return gamePageSizes;
	}

	get isLoading() {
		return !this.#gameStore.hasLoaded;
	}

	get pageParams() {
		return this.#pageParams;
	}

	get filtersCount() {
		return this.#filtersCount;
	}

	getPaginationSequence = (currentPage: number, totalPages: number) => {
		const delta = 2; // how many pages to show around current
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
}
