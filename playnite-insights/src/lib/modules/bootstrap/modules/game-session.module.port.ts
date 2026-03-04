import type { ISyncGameSessionsFlowPort } from "$lib/modules/game-session/application";
import type {
	IGameSessionReadonlyStorePort,
	IGameSessionWriteStorePort,
} from "$lib/modules/game-session/infra";

export type IClientGameSessionModulePort = {
	get gameSessionWriteStore(): IGameSessionWriteStorePort;
	get gameSessionReadonlyStore(): IGameSessionReadonlyStorePort;
	get syncGameSessionsFlow(): ISyncGameSessionsFlowPort;
};
