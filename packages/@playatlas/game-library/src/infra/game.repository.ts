import { ISODateSchema } from "@playatlas/common/common";
import {
	completionStatusIdSchema,
	GameIdParser,
	gameIdSchema,
	playniteCompletionStatusIdSchema,
	playniteGameIdSchema,
	type CompanyId,
	type GameId,
	type GenreId,
	type PlatformId,
	type TagId,
} from "@playatlas/common/domain";
import { makeBaseRepository, type BaseRepositoryDeps } from "@playatlas/common/infra";
import z from "zod";
import type { IGameMapperPort } from "../application";
import type { GameRelationship } from "../domain/game.entity.types";
import type { IGameRelationshipStorePort } from "./game-relationship.store.port";
import { COLUMNS, TABLE_NAME } from "./game.repository.constants";
import type { GameRepositoryEagerLoadProps, IGameRepositoryPort } from "./game.repository.port";
import type { GameFilters } from "./game.repository.types";

export const GROUPADD_SEPARATOR = ",";

export const gameSchema = z.object({
	Id: gameIdSchema,
	PlayniteId: playniteGameIdSchema.nullable(),
	PlayniteName: z.string().nullable(),
	PlayniteDescription: z.string().nullable(),
	PlayniteReleaseDate: ISODateSchema.nullable(),
	PlaynitePlaytime: z.number(),
	PlayniteLastActivity: z.string().nullable(),
	PlayniteAdded: ISODateSchema.nullable(),
	PlayniteInstallDirectory: z.string().nullable(),
	PlayniteIsInstalled: z.number(),
	PlayniteHidden: z.number(),
	PlayniteCompletionStatusId: playniteCompletionStatusIdSchema.nullable(),
	PlayniteBackgroundImagePath: z.string().nullable(),
	PlayniteCoverImagePath: z.string().nullable(),
	PlayniteIconImagePath: z.string().nullable(),
	CompletionStatusId: completionStatusIdSchema.nullable(),
	ContentHash: z.string(),
	LastUpdatedAt: ISODateSchema,
	CreatedAt: ISODateSchema,
	DeletedAt: ISODateSchema.nullable(),
	DeleteAfter: ISODateSchema.nullable(),
});

export type GameModel = z.infer<typeof gameSchema>;

export const gameManifestDataSchema = z.array(
	z.object({
		Id: playniteGameIdSchema,
		ContentHash: z.string(),
	}),
);

export type GameManifestData = z.infer<typeof gameManifestDataSchema>;

type GameRepositoryDeps = BaseRepositoryDeps & {
	gameMapper: IGameMapperPort;
	relationshipStore: IGameRelationshipStorePort;
};

export const makeGameRepository = ({
	getDb,
	logService,
	gameMapper,
	relationshipStore,
}: GameRepositoryDeps): IGameRepositoryPort => {
	const getWhereClauseAndParamsFromFilters = (filters?: GameFilters) => {
		const where: string[] = [];
		const params: (string | number)[] = [];

		if (!filters) {
			return { where: "", params };
		}

		if (filters.hidden !== undefined && filters.hidden !== null) {
			where.push(`Hidden = ?`);
			params.push(+filters.hidden);
		}

		if (filters.syncCursor) {
			const syncCursor = filters.syncCursor;

			where.push(`(LastUpdatedAt > ? OR (LastUpdatedAt = ? AND Id > ?))`);
			params.push(
				syncCursor.lastUpdatedAt.toISOString(),
				syncCursor.lastUpdatedAt.toISOString(),
				syncCursor.id,
			);
		}

		return {
			where: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
			params,
		};
	};

	const getOrderBy = () => `ORDER BY LastUpdatedAt ASC, Id ASC`;

	const base = makeBaseRepository({
		getDb,
		logService,
		config: {
			tableName: TABLE_NAME,
			idColumn: "Id",
			insertColumns: COLUMNS,
			updateColumns: COLUMNS.filter((c) => c !== "Id"),
			mapper: gameMapper,
			modelSchema: gameSchema,
			getWhereClauseAndParamsFromFilters,
			getOrderBy,
		},
	});

	const _shouldLoadRelationship = (
		load: GameRepositoryEagerLoadProps["load"],
		relationship: GameRelationship,
	): boolean => {
		if (typeof load === "boolean") return load;
		else if (load?.[relationship] === true) return true;
		else return false;
	};

	const _getAllRelationshipsForGame = (
		gameIds: GameId[],
		load: GameRepositoryEagerLoadProps["load"],
	) => {
		let developerIds: Map<GameId, CompanyId[]> | null = null;
		if (_shouldLoadRelationship(load, "developers"))
			developerIds = relationshipStore.loadForGames({
				relationship: "developers",
				gameIds,
			});

		let publisherIds: Map<GameId, CompanyId[]> | null = null;
		if (_shouldLoadRelationship(load, "publishers"))
			publisherIds = relationshipStore.loadForGames({
				relationship: "publishers",
				gameIds,
			});

		let genreIds: Map<GameId, GenreId[]> | null = null;
		if (_shouldLoadRelationship(load, "genres"))
			genreIds = relationshipStore.loadForGames({
				relationship: "genres",
				gameIds,
			});

		let platformIds: Map<GameId, PlatformId[]> | null = null;
		if (_shouldLoadRelationship(load, "platforms"))
			platformIds = relationshipStore.loadForGames({
				relationship: "platforms",
				gameIds,
			});

		let tagIds: Map<GameId, TagId[]> | null = null;
		if (_shouldLoadRelationship(load, "tags"))
			tagIds = relationshipStore.loadForGames({ relationship: "tags", gameIds });

		return { developerIds, publisherIds, genreIds, platformIds, tagIds };
	};

	const getTotal: IGameRepositoryPort["getTotal"] = (filters) => {
		return base.run(({ db }) => {
			let query = `
          SELECT 
            COUNT(*) AS Total
          FROM ${TABLE_NAME} pg
        `;
			const { where, params } = getWhereClauseAndParamsFromFilters(filters);
			query += where;
			const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;

			logService.debug(`Query returned total amount of records: ${total}`);

			return total;
		}, `getTotal()`);
	};

	const getById: IGameRepositoryPort["getById"] = (id, props = {}) => {
		return base.run(({ db }) => {
			const query = `SELECT * FROM ${TABLE_NAME} WHERE Id = (?)`;
			const stmt = db.prepare(query);
			const result = stmt.get(id);

			const { success, data: gameModel, error } = z.optional(gameSchema).safeParse(result);

			if (!success) {
				throw base.buildValidationError(error, { entity: "game", operation: "load" });
			}

			if (!gameModel) return null;

			const modelId = GameIdParser.fromTrusted(gameModel.Id);

			const { developerIds, genreIds, platformIds, publisherIds, tagIds } =
				_getAllRelationshipsForGame([modelId], props.load);

			logService.debug(`Query returned record ${gameModel?.PlayniteName}`);

			return gameMapper.toDomain(gameModel, {
				developerIds: developerIds?.get(modelId) ?? null,
				publisherIds: publisherIds?.get(modelId) ?? null,
				genreIds: genreIds?.get(modelId) ?? null,
				platformIds: platformIds?.get(modelId) ?? null,
				tagIds: tagIds?.get(modelId) ?? null,
			});
		}, `getById(${id})`);
	};

	const getByPlayniteId: IGameRepositoryPort["getByPlayniteId"] = (id, props = {}) => {
		return base.run(({ db }) => {
			const query = `SELECT * FROM ${TABLE_NAME} WHERE PlayniteId = (?)`;
			const stmt = db.prepare(query);
			const result = stmt.get(id);

			const { success, data: gameModel, error } = z.optional(gameSchema).safeParse(result);

			if (!success) {
				throw base.buildValidationError(error, { entity: "game", operation: "load" });
			}

			if (!gameModel) return null;

			const modelId = GameIdParser.fromTrusted(gameModel.Id);

			const { developerIds, genreIds, platformIds, publisherIds, tagIds } =
				_getAllRelationshipsForGame([modelId], props.load);

			logService.debug(`Query returned record ${gameModel?.PlayniteName}`);

			return gameMapper.toDomain(gameModel, {
				developerIds: developerIds?.get(modelId) ?? null,
				publisherIds: publisherIds?.get(modelId) ?? null,
				genreIds: genreIds?.get(modelId) ?? null,
				platformIds: platformIds?.get(modelId) ?? null,
				tagIds: tagIds?.get(modelId) ?? null,
			});
		}, `getByPlayniteId(${id})`);
	};

	const upsert: IGameRepositoryPort["upsert"] = (games) => {
		const result = base._upsert(games);

		for (const [game, model] of result) {
			if (game.isDeleted()) continue;

			const modelId = GameIdParser.fromTrusted(model.Id);
			if (game.relationships.developers.isLoaded())
				relationshipStore.replaceForGame({
					relationship: "developers",
					gameId: modelId,
					newRelationshipIds: game.relationships.developers.get(),
				});
			if (game.relationships.publishers.isLoaded())
				relationshipStore.replaceForGame({
					relationship: "publishers",
					gameId: modelId,
					newRelationshipIds: game.relationships.publishers.get(),
				});
			if (game.relationships.genres.isLoaded())
				relationshipStore.replaceForGame({
					relationship: "genres",
					gameId: modelId,
					newRelationshipIds: game.relationships.genres.get(),
				});
			if (game.relationships.platforms.isLoaded())
				relationshipStore.replaceForGame({
					relationship: "platforms",
					gameId: modelId,
					newRelationshipIds: game.relationships.platforms.get(),
				});
			if (game.relationships.tags.isLoaded())
				relationshipStore.replaceForGame({
					relationship: "tags",
					gameId: modelId,
					newRelationshipIds: game.relationships.tags.get(),
				});
		}
	};

	const getManifestData: IGameRepositoryPort["getManifestData"] = () => {
		return base.run(({ db }) => {
			const query = `
				SELECT PlayniteId as Id, ContentHash 
				FROM ${TABLE_NAME}
				WHERE DeletedAt IS NULL;
			`;
			const stmt = db.prepare(query);
			const result = stmt.all();

			const { success, data, error } = gameManifestDataSchema.safeParse(result);

			if (!success) {
				throw base.buildValidationError(error, { entity: "game", operation: "load" });
			}

			logService.debug(`Fetched manifest game data, total games in library: ${data.length}`);

			return data;
		}, `getManifestData()`);
	};

	const getTotalPlaytimeSeconds: IGameRepositoryPort["getTotalPlaytimeSeconds"] = (filters) => {
		return base.run(({ db }) => {
			let query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM ${TABLE_NAME} `;
			const { where, params } = getWhereClauseAndParamsFromFilters(filters);
			query += where;
			const stmt = db.prepare(query);
			const result = stmt.get(...params);

			if (!result) return 0;

			const data = result.totalPlaytimeSeconds as number;

			logService.debug(`Calculated total playtime: ${data} seconds`);

			return data;
		}, `getTotalPlaytimeSeconds()`);
	};

	const all: IGameRepositoryPort["all"] = (props = {}, filters = {}) => {
		return base.run(({ db }) => {
			let query = `SELECT * FROM ${TABLE_NAME} `;
			const { where, params } = getWhereClauseAndParamsFromFilters(filters);
			query += where;
			query += ` ${getOrderBy()}`;
			const stmt = db.prepare(query);
			const rows = stmt.all(...params);

			const { success, data: gameModels, error } = z.array(gameSchema).safeParse(rows);

			if (!success) {
				throw base.buildValidationError(error, { entity: "game", operation: "load" });
			}

			const gameModelsIds = gameModels.map((m) => m.Id).map(GameIdParser.fromTrusted);

			const relation = _getAllRelationshipsForGame(gameModelsIds, props.load);

			const games = gameModels.map((gameModel) => {
				const modelId = GameIdParser.fromTrusted(gameModel.Id);
				const developerIds: CompanyId[] | null = relation.developerIds?.get(modelId) ?? null;
				const publisherIds: CompanyId[] | null = relation.publisherIds?.get(modelId) ?? null;
				const genreIds: GenreId[] | null = relation.genreIds?.get(modelId) ?? null;
				const platformIds: PlatformId[] | null = relation.platformIds?.get(modelId) ?? null;
				const tagIds: TagId[] | null = relation.tagIds?.get(modelId) ?? null;

				return gameMapper.toDomain(gameModel, {
					developerIds,
					publisherIds,
					genreIds,
					platformIds,
					tagIds,
				});
			});

			logService.debug(`Query returned ${games?.length ?? 0} records`);
			return games;
		}, `all()`);
	};

	return {
		...base.public,
		upsert,
		getById,
		getByPlayniteId,
		getTotalPlaytimeSeconds,
		getManifestData,
		getTotal,
		all,
	};
};
