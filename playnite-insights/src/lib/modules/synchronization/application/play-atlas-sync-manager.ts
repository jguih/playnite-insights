import type {
	IClockPort,
	IDomainEventBusPort,
	ISyncFlowPort,
	SyncRunnerResult,
} from "$lib/modules/common/application";
import type { SyncTarget } from "$lib/modules/common/domain";
import type { IClientStorageManagerPort } from "$lib/modules/common/infra";
import type { IInstancePreferenceModelServicePort } from "$lib/modules/game-library/application";
import type { IPlayAtlasSyncManagerPort } from "./play-atlas-sync-manager.port";
import type { ISyncProgressReporterPort } from "./sync-progress-reporter.svelte";

export type PlayAtlasSyncManagerDeps = {
	syncGamesFlow: ISyncFlowPort;
	syncCompletionStatusesFlow: ISyncFlowPort;
	syncCompaniesFlow: ISyncFlowPort;
	syncGenresFlow: ISyncFlowPort;
	syncPlatformsFlow: ISyncFlowPort;
	syncGameClassificationsFlow: ISyncFlowPort;
	syncGameSessionsFlow: ISyncFlowPort;
	progressReporter: ISyncProgressReporterPort;
	clock: IClockPort;
	eventBus: IDomainEventBusPort;
	instancePreferenceModelService: IInstancePreferenceModelServicePort;
	storageManager: IClientStorageManagerPort;
};

export class PlayAtlasSyncManager implements IPlayAtlasSyncManagerPort {
	private readonly MIN_VISIBLE_MS = 500;
	private syncing = false;

	constructor(private readonly deps: PlayAtlasSyncManagerDeps) {}

	executeAsync: IPlayAtlasSyncManagerPort["executeAsync"] = async () => {
		if (this.syncing) return;
		this.syncing = true;

		const { progressReporter, clock, eventBus, instancePreferenceModelService, storageManager } =
			this.deps;

		const startedAt = clock.now().getTime();
		progressReporter.report({ type: "sync-started" });

		try {
			let updatedEntities = 0;

			const flows: Array<{ key: SyncTarget; run: () => Promise<SyncRunnerResult> }> = [
				{ key: "games", run: this.deps.syncGamesFlow.executeAsync },
				{ key: "completionStatuses", run: this.deps.syncCompletionStatusesFlow.executeAsync },
				{ key: "companies", run: this.deps.syncCompaniesFlow.executeAsync },
				{ key: "genres", run: this.deps.syncGenresFlow.executeAsync },
				{ key: "platforms", run: this.deps.syncPlatformsFlow.executeAsync },
				{ key: "gameClassifications", run: this.deps.syncGameClassificationsFlow.executeAsync },
				{ key: "gameSessions", run: this.deps.syncGameSessionsFlow.executeAsync },
			];

			for (const { key, run } of flows) {
				progressReporter.report({ type: "flow-started", flow: key });
				try {
					const result = await run();
					if (result.success) updatedEntities += result.updatedEntities;
				} finally {
					progressReporter.report({ type: "flow-finished", flow: key });
				}
			}

			if (updatedEntities > 0) {
				await storageManager.ensureDurableStorageAsync();
				await instancePreferenceModelService.rebuildAsync();

				eventBus.emit({
					id: crypto.randomUUID(),
					name: "game-library-updated",
					occurredAt: this.deps.clock.now(),
				});
			}
		} finally {
			const elapsed = clock.now().getTime() - startedAt;
			const remaining = Math.max(0, this.MIN_VISIBLE_MS - elapsed);

			setTimeout(() => {
				progressReporter.report({ type: "sync-finished" });

				eventBus.emit({
					id: crypto.randomUUID(),
					name: "sync-finished",
					occurredAt: this.deps.clock.now(),
				});
			}, remaining);

			this.syncing = false;
		}
	};
}
