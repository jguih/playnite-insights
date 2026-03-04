import type { IClockPort, ILogServicePort } from "$lib/modules/common/application";
import type { IPlayAtlasSyncStatePort } from "$lib/modules/common/application/play-atlas-sync-state.port";
import { IndexedDBNotInitializedError } from "$lib/modules/common/errors";
import {
	ClientStorageManager,
	INDEXEDDB_CURRENT_VERSION,
	INDEXEDDB_NAME,
	type IClientStorageManagerPort,
	type IIndexedDbSchema,
} from "$lib/modules/common/infra";
import { PlayAtlasSyncState } from "$lib/modules/game-library/infra";
import type { IClientInfraModulePort } from "./infra.module.port";

export type IndexedDbSignal = { db: IDBDatabase | null; dbReady: boolean };

export type ClientInfraModuleDeps = {
	logService: ILogServicePort;
	schemas: IIndexedDbSchema[];
	clock: IClockPort;
};

export class ClientInfraModule implements IClientInfraModulePort {
	private readonly indexedDbSignal: IndexedDbSignal;

	readonly playAtlasSyncState: IPlayAtlasSyncStatePort;
	readonly storageManager: IClientStorageManagerPort;

	get dbSignal(): IDBDatabase {
		if (!this.indexedDbSignal.dbReady || !this.indexedDbSignal.db)
			throw new IndexedDBNotInitializedError();
		return this.indexedDbSignal.db;
	}

	constructor(private readonly deps: ClientInfraModuleDeps) {
		this.indexedDbSignal = $state({
			db: null,
			dbReady: false,
		});

		this.playAtlasSyncState = new PlayAtlasSyncState();
		this.storageManager = new ClientStorageManager();
	}

	private openIndexedDbAsync = (props: {
		dbName: string;
		version: number;
		schemas: IIndexedDbSchema[];
	}): Promise<IDBDatabase> => {
		const { dbName, version, schemas } = props;
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(dbName, version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				const db = request.result;

				db.onversionchange = () => {
					db.close();
					this.deps.logService.warning("Database is outdated, please reload the app");
				};

				resolve(request.result);
			};
			request.onupgradeneeded = (event) => {
				const db = request.result;
				const tx = request.transaction!;
				const oldVersion = event.oldVersion;
				const newVersion = event.newVersion;

				for (const schema of schemas) {
					schema.define({ db, tx, oldVersion, newVersion });
				}
			};
		});
	};

	public initializeAsync = async () => {
		this.indexedDbSignal.db = await this.openIndexedDbAsync({
			dbName: INDEXEDDB_NAME,
			version: INDEXEDDB_CURRENT_VERSION,
			schemas: this.deps.schemas,
		});
		this.indexedDbSignal.dbReady = true;
	};
}
