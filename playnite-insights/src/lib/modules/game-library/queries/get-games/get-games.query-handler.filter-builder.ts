import { normalize } from "$lib/modules/common/common";
import type { GameFilter } from "./get-games.query-handler.types";

export type IGetGamesQueryHandlerFilterBuilderPort = {
	createNameFilter: (search?: string) => GameFilter;
	createNotDeletedFilter: () => GameFilter;
	createNotHiddenFilter: () => GameFilter;
};

export class GetGamesQueryHandlerFilterBuilder implements IGetGamesQueryHandlerFilterBuilderPort {
	createNameFilter = (search?: string): GameFilter => {
		if (!search) {
			return () => true;
		}

		const normalizedSearch = normalize(search);

		return (game) => {
			const name = game.SearchName;
			if (!name) return false;

			return name.startsWith(normalizedSearch);
		};
	};

	createNotDeletedFilter = (): GameFilter => {
		return (game) => {
			if (game.DeletedAt) return false;
			return true;
		};
	};

	createNotHiddenFilter = (): GameFilter => {
		return (game) => {
			return game.Playnite?.Hidden === false;
		};
	};
}
