import type { IHorrorScoreEnginePort } from "@playatlas/game-library/application";
import {
	makeGameLibraryModule,
	type GameLibraryModuleDeps,
	type IGameLibraryModulePort,
} from "../../application/modules";

export type TestGameLibraryModuleDeps = GameLibraryModuleDeps & {
	horrorEngine?: IHorrorScoreEnginePort;
};

export const makeTestGameLibraryModule = ({
	horrorEngine,
	...deps
}: TestGameLibraryModuleDeps): IGameLibraryModulePort => {
	const _game_library_module = makeGameLibraryModule({ ...deps, scoreEngine: { horrorEngine } });

	return _game_library_module;
};
