import type { GetGamesQueryFilter, GetGamesQuerySort } from "$lib/modules/common/queries";
import type { GameCardProjection } from "$lib/ui/components/game-card/game-card.projection";

export type GameLibraryPagerState = {
	loading: boolean;
	exhausted: boolean;
	games: GameCardProjection[];
} & (
	| {
			readonly mode: "query";
			nextKey: IDBValidKey | null;
			query: {
				filters: GetGamesQueryFilter;
				sort: GetGamesQuerySort;
			};
	  }
	| {
			readonly mode: "ranked";
			nextKey: number | null;
			query: {
				filters: GetGamesQueryFilter;
			};
	  }
);

export type SetGameLibraryPagerQueryProps =
	| {
			readonly mode: "query";
			filters?: GetGamesQueryFilter;
			sort?: GetGamesQuerySort;
	  }
	| {
			readonly mode: "ranked";
			filters?: GetGamesQueryFilter;
	  };
