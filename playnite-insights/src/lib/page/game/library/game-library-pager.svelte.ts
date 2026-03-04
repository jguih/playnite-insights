import type { ClientApiGetter } from "$lib/modules/bootstrap/application";
import type { GameCardProjection } from "$lib/ui/components/game-card/game-card.projection";
import type {
	GameLibraryPagerState,
	SetGameLibraryPagerQueryProps,
} from "./game-library-pager.types";
import { resetGameLibraryScrollPosition } from "./game-library-scroll-position.svelte";

export type GameLibraryPagerDeps = {
	api: ClientApiGetter;
};

let pagerStateSignal = $state<GameLibraryPagerState>({
	mode: "query",
	games: [],
	nextKey: null,
	loading: false,
	exhausted: false,
	query: { filters: {}, sort: { type: "recentlyUpdated", direction: "desc" } },
});

export class GameLibraryPager {
	private currentVersion = 0;

	constructor(private readonly deps: GameLibraryPagerDeps) {}

	get pagerStateSignal(): Readonly<GameLibraryPagerState> {
		return pagerStateSignal;
	}

	getSignalSnapshot = (): GameLibraryPagerState => {
		const pagerStateSnapshot = $state.snapshot(
			pagerStateSignal,
		) as unknown as GameLibraryPagerState;
		return pagerStateSnapshot;
	};

	private withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
		if (pagerStateSignal.loading) {
			console.warn("withLoading called while already loading");
		}

		pagerStateSignal.loading = true;

		try {
			return await fn();
		} finally {
			pagerStateSignal.loading = false;
		}
	};

	private loadFromRankedAsync = async () => {
		await this.withLoading(async () => {
			const pagerStateSnapshot = this.getSignalSnapshot();

			const versionStart = this.currentVersion;
			if (pagerStateSnapshot.mode !== "ranked") return;

			const result = await this.deps.api().GameLibrary.Query.GetGamesRanked.executeAsync({
				limit: 50,
				filter: pagerStateSnapshot.query.filters,
				cursor: pagerStateSnapshot.nextKey,
			});

			if (versionStart !== this.currentVersion) {
				return;
			}

			const cardProjectionItems = result.games.map(
				(i) =>
					({
						id: i.Id,
						name: i.Playnite?.Name ?? "Unknown",
						coverImageFilePath: i.Playnite?.CoverImagePath,
					}) satisfies GameCardProjection,
			);

			pagerStateSignal.games.push(...cardProjectionItems);
			pagerStateSignal.nextKey = result.nextKey;
			pagerStateSignal.exhausted = result.nextKey === null;
		});
	};

	private loadFromQueryAsync = async () => {
		return await this.withLoading(async () => {
			const pagerStateSnapshot = this.getSignalSnapshot();

			const versionStart = this.currentVersion;
			if (pagerStateSnapshot.mode !== "query") return;

			const cursor = pagerStateSnapshot.nextKey;

			const result = await this.deps.api().GameLibrary.Query.GetGames.executeAsync({
				limit: 50,
				sort: pagerStateSnapshot.query.sort,
				cursor,
				filter: pagerStateSnapshot.query.filters,
			});

			if (versionStart !== this.currentVersion) {
				return;
			}

			const cardProjectionItems = result.items.map(
				(i) =>
					({
						id: i.Id,
						name: i.Playnite?.Name ?? "Unknown",
						coverImageFilePath: i.Playnite?.CoverImagePath,
					}) satisfies GameCardProjection,
			);

			pagerStateSignal.games.push(...cardProjectionItems);
			pagerStateSignal.nextKey = result.nextKey;
			pagerStateSignal.exhausted = result.nextKey === null;
		});
	};

	loadMoreAsync = async () => {
		if (pagerStateSignal.loading || pagerStateSignal.exhausted) return;

		if (pagerStateSignal.mode === "query") {
			await this.loadFromQueryAsync();
		} else if (pagerStateSignal.mode === "ranked") {
			await this.loadFromRankedAsync();
		}
	};

	setQuery = (query: SetGameLibraryPagerQueryProps) => {
		resetGameLibraryScrollPosition();

		switch (query.mode) {
			case "ranked": {
				pagerStateSignal = {
					mode: "ranked",
					query: { filters: query.filters ?? {} },
					loading: false,
					exhausted: false,
					games: [],
					nextKey: null,
				};
				break;
			}
			case "query":
			default:
				pagerStateSignal = {
					mode: "query",
					query: {
						filters: query.filters ?? {},
						sort: query.sort ?? { type: "recentlyUpdated", direction: "desc" },
					},
					loading: false,
					exhausted: false,
					games: [],
					nextKey: null,
				};
				break;
		}

		this.currentVersion++;
	};
}
