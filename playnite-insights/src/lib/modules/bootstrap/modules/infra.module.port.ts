import type { IPlayAtlasSyncStatePort } from "$lib/modules/common/application";
import type { IClientStorageManagerPort } from "$lib/modules/common/infra";

export interface IClientInfraModulePort {
	initializeAsync: () => Promise<void>;
	get dbSignal(): IDBDatabase;
	get playAtlasSyncState(): IPlayAtlasSyncStatePort;
	get storageManager(): IClientStorageManagerPort;
}
