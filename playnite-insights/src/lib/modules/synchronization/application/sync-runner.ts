import type {
	IClockPort,
	IPlayAtlasSyncStatePort,
	ISyncRunnerPort,
} from "$lib/modules/common/application";

export type SyncRunnerDeps = {
	clock: IClockPort;
	syncState: IPlayAtlasSyncStatePort;
};

export class SyncRunner implements ISyncRunnerPort {
	constructor(private readonly deps: SyncRunnerDeps) {}

	runAsync: ISyncRunnerPort["runAsync"] = async ({
		fetchAsync,
		mapDtoToEntity: map,
		persistAsync,
		syncTarget,
	}) => {
		const { clock, syncState } = this.deps;

		const now = clock.now();
		const lastCursor = syncState.getLastServerSyncCursor(syncTarget);

		const response = await fetchAsync({ lastCursor });

		if (!response.success)
			return {
				success: false,
				reason_code: "fetch_failed",
			};

		const entities = response.items.map((i) => map({ dto: i, now }));

		if (entities.length > 0) await persistAsync({ entities });

		syncState.setLastServerSyncCursor(syncTarget, response.nextCursor);

		return {
			success: true,
			updatedEntities: entities.length,
		};
	};
}
