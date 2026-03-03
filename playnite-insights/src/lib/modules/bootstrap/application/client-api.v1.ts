import type {
	IAuthFlowPort,
	IExtensionAuthorizationServicePort,
	IExtensionRegistrationClient,
	ISessionIdCheckerPort,
} from "$lib/modules/auth/application";
import type { IDomainEventBusPort, IPlayAtlasEventHubPort } from "$lib/modules/common/application";
import type { IRecommendationEnginePort } from "$lib/modules/game-library/application";
import type {
	ICreateGameLibraryCommandHandler,
	ISyncCompaniesCommandHandlerPort,
	ISyncCompletionStatusesCommandHandlerPort,
	ISyncGameClassificationsCommandHandlerPort,
	ISyncGamesCommandHandlerPort,
	ISyncGenresCommandHandlerPort,
	ISyncPlatformsCommandHandlerPort,
} from "$lib/modules/game-library/commands";
import type {
	IGetCompaniesByIdsQueryHandlerPort,
	IGetCompletionStatusesByIdsQueryHandlerPort,
	IGetGameClassificationByGameIdQueryHandler,
	IGetGameClassificationByIdsQueryHandler,
	IGetGameLibraryFiltersQueryHandlerPort,
	IGetGamesByIdsQueryHandlerPort,
	IGetGamesQueryHandlerPort,
	IGetGamesRankedQueryHandlerPort,
	IGetGenreByIdQueryHandlerPort,
	IGetGenresByIdsQueryHandlerPort,
	IGetLatestGameClassificationByGameIdQueryHandler,
	IGetPlatformsByIdsQueryHandlerPort,
} from "$lib/modules/game-library/queries";
import type { IGameSessionReadonlyStorePort } from "$lib/modules/game-session/infra";
import type {
	IPlayAtlasSyncManagerPort,
	ISyncProgressReporterPort,
} from "$lib/modules/synchronization/application";

export interface ClientApiV1 {
	GameLibrary: {
		ScoringEngine: {
			Query: {
				GetGameClassifications: IGetGameClassificationByIdsQueryHandler;
				GetGameClassificationsByGameId: IGetGameClassificationByGameIdQueryHandler;
				GetLatestGameClassificationByGameId: IGetLatestGameClassificationByGameIdQueryHandler;
			};
			Command: {
				UpsertGameClassifications: ISyncGameClassificationsCommandHandlerPort;
			};
		};
		RecommendationEngine: {
			Engine: IRecommendationEnginePort;
		};
		Query: {
			GetGames: IGetGamesQueryHandlerPort;
			GetGamesByIds: IGetGamesByIdsQueryHandlerPort;
			GetGamesRanked: IGetGamesRankedQueryHandlerPort;
			GetGenreById: IGetGenreByIdQueryHandlerPort;
			GetGenresByIds: IGetGenresByIdsQueryHandlerPort;
			GetCompaniesByIds: IGetCompaniesByIdsQueryHandlerPort;
			GetPlatformsByIds: IGetPlatformsByIdsQueryHandlerPort;
			GetCompletionStatusesByIds: IGetCompletionStatusesByIdsQueryHandlerPort;
			GetGameLibraryFilters: IGetGameLibraryFiltersQueryHandlerPort;
		};
		Command: {
			SyncGames: ISyncGamesCommandHandlerPort;
			SyncGenres: ISyncGenresCommandHandlerPort;
			SyncCompanies: ISyncCompaniesCommandHandlerPort;
			SyncPlatforms: ISyncPlatformsCommandHandlerPort;
			SyncCompletionStatuses: ISyncCompletionStatusesCommandHandlerPort;
			CreateGameLibraryFilter: ICreateGameLibraryCommandHandler;
		};
	};
	Synchronization: {
		SyncManager: IPlayAtlasSyncManagerPort;
		SyncProgressReporter: ISyncProgressReporterPort;
	};
	Auth: {
		Flow: IAuthFlowPort;
		hasSession: ISessionIdCheckerPort["hasSession"];
		ExtensionRegistrationClient: IExtensionRegistrationClient;
		ExtensionAuthorizationService: IExtensionAuthorizationServicePort;
	};
	GameSession: {
		GameSessionReadonlyStore: IGameSessionReadonlyStorePort;
	};
	EventBus: IDomainEventBusPort;
	PlayAtlasEventHub: IPlayAtlasEventHubPort;
}
