import type { IDomainEventBusPort } from "$lib/modules/common/application";
import type { IClientStorageManagerPort } from "$lib/modules/common/infra";
import type {
	IInstancePreferenceModelServicePort,
	ISyncCompaniesFlowPort,
	ISyncCompletionStatusesFlowPort,
	ISyncGameClassificationsFlowPort,
	ISyncGamesFlowPort,
	ISyncGenresFlowPort,
	ISyncPlatformsFlowPort,
} from "$lib/modules/game-library/application";
import type { ISyncGameSessionsFlowPort } from "$lib/modules/game-session/application";
import {
	PlayAtlasSyncManager,
	SyncProgressReporter,
	type IPlayAtlasSyncManagerPort,
	type ISyncProgressReporterPort,
} from "$lib/modules/synchronization/application";
import type { IClockPort } from "@playatlas/common/infra";
import type { ISynchronizationModulePort } from "./synchronization.module.port";

export type SynchronizationModuleDeps = {
	syncGamesFlow: ISyncGamesFlowPort;
	syncCompletionStatusesFlow: ISyncCompletionStatusesFlowPort;
	syncCompaniesFlow: ISyncCompaniesFlowPort;
	syncGenresFlow: ISyncGenresFlowPort;
	syncPlatformsFlow: ISyncPlatformsFlowPort;
	syncGameClassificationsFlow: ISyncGameClassificationsFlowPort;
	syncGameSessionsFlow: ISyncGameSessionsFlowPort;
	clock: IClockPort;
	eventBus: IDomainEventBusPort;
	instancePreferenceModelService: IInstancePreferenceModelServicePort;
	storageManager: IClientStorageManagerPort;
};

export class SynchronizationModule implements ISynchronizationModulePort {
	readonly syncProgressReporter: ISyncProgressReporterPort;
	readonly syncManager: IPlayAtlasSyncManagerPort;

	constructor(private readonly deps: SynchronizationModuleDeps) {
		this.syncProgressReporter = new SyncProgressReporter();
		this.syncManager = new PlayAtlasSyncManager({
			clock: this.deps.clock,
			eventBus: this.deps.eventBus,
			progressReporter: this.syncProgressReporter,
			syncCompaniesFlow: this.deps.syncCompaniesFlow,
			syncCompletionStatusesFlow: this.deps.syncCompletionStatusesFlow,
			syncGameClassificationsFlow: this.deps.syncGameClassificationsFlow,
			syncGamesFlow: this.deps.syncGamesFlow,
			syncGenresFlow: this.deps.syncGenresFlow,
			syncPlatformsFlow: this.deps.syncPlatformsFlow,
			syncGameSessionsFlow: this.deps.syncGameSessionsFlow,
			instancePreferenceModelService: this.deps.instancePreferenceModelService,
			storageManager: this.deps.storageManager,
		});
	}
}
