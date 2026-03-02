import type { IDomainEventBusPort } from "$lib/modules/common/application";
import type { IClientGameSessionModulePort, ISynchronizationModulePort } from "../modules";
import type { IAuthModulePort } from "../modules/auth.module.port";
import type { IClientGameLibraryModulePort } from "../modules/game-library.module.port";
import type { IClientInfraModulePort } from "../modules/infra.module.port";
import type { ClientApiV1 } from "./client-api.v1";

export type ClientModules = {
	infra: IClientInfraModulePort;
	gameLibrary: IClientGameLibraryModulePort;
	auth: IAuthModulePort;
	gameSession: IClientGameSessionModulePort;
	synchronization: ISynchronizationModulePort;
};

export type ClientBootstrapperDeps = {
	modules: ClientModules;
	eventBus: IDomainEventBusPort;
};

export class ClientBootstrapper {
	constructor(private readonly deps: ClientBootstrapperDeps) {}

	bootstrap(): ClientApiV1 {
		const {
			eventBus,
			modules: { auth, gameLibrary, gameSession, synchronization },
		} = this.deps;

		const api: ClientApiV1 = {
			GameLibrary: {
				ScoringEngine: {
					Query: {
						GetGameClassifications: gameLibrary.getGameClassificationsByIdsQueryHandler,
						GetGameClassificationsByGameId: gameLibrary.getGameClassificationsByGameIdQueryHandler,
						GetLatestGameClassificationByGameId:
							gameLibrary.getLatestGameClassificationByGameIdQueryHandler,
					},
					Command: {
						UpsertGameClassifications: gameLibrary.syncGameClassificationsCommandHandler,
					},
				},
				RecommendationEngine: {
					Engine: gameLibrary.recommendationEngineModule.recommendationEngine,
				},
				Query: {
					GetGames: gameLibrary.getGamesQueryHandler,
					GetGamesByIds: gameLibrary.getGamesByIdsQueryHandler,
					GetGenreById: gameLibrary.getGenreByIdQueryHandler,
					GetGamesRanked: gameLibrary.getGamesRankedQueryHandler,
					GetGenresByIds: gameLibrary.getGenresByIdsQueryHandler,
					GetCompaniesByIds: gameLibrary.getCompaniesByIdsQueryHandler,
					GetPlatformsByIds: gameLibrary.getPlatformsByIdsQueryHandler,
					GetCompletionStatusesByIds: gameLibrary.getCompletionStatusesByIdsQueryHandler,
					GetGameLibraryFilters: gameLibrary.getGameLibraryFiltersQueryHandler,
				},
				Command: {
					SyncGames: gameLibrary.syncGamesCommandHandler,
					SyncGenres: gameLibrary.syncGenresCommandHandler,
					SyncCompanies: gameLibrary.syncCompaniesCommandHandler,
					SyncPlatforms: gameLibrary.syncPlatformsCommandHandler,
					SyncCompletionStatuses: gameLibrary.syncCompletionStatusesCommandHandler,
					CreateGameLibraryFilter: gameLibrary.createGameLibraryFilterCommandHandler,
				},
			},
			GameSession: {
				GameSessionReadonlyStore: gameSession.gameSessionReadonlyStore,
			},
			Synchronization: {
				SyncManager: synchronization.syncManager,
				SyncProgressReporter: synchronization.syncProgressReporter,
			},
			Auth: {
				Flow: auth.authFlow,
				hasSession: auth.hasSession,
				ExtensionRegistrationClient: auth.extensionRegistrationClient,
				ExtensionAuthorizationService: auth.extensionAuthorizationService,
			},
			EventBus: eventBus,
		};

		return Object.freeze(api);
	}
}
