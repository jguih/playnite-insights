import type { ClientEntity } from "$lib/modules/common/common";
import type { SyncRunnerConfig, SyncRunnerResult } from "./sync-runner.types";

export type ISyncRunnerPort = {
	runAsync: <TEntityKey extends IDBValidKey, TEntity extends ClientEntity<TEntityKey>, TDto>(
		config: SyncRunnerConfig<TEntity, TDto>,
	) => Promise<SyncRunnerResult>;
};
