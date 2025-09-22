import type { GameSignal } from '../app-state/AppData.types';

export type GameListViewModelDeps = {
	gameSignal: GameSignal;
};

export class GameListViewModel {
	#gameSignal: GameSignal;

	constructor(deps: GameListViewModelDeps) {
		this.#gameSignal = deps.gameSignal;
	}

	get gameList() {
		return this.#gameSignal.raw ?? [];
	}
}
