import { ISODateSchema } from "@playatlas/common/common";
import {
	CLASSIFICATION_IDS,
	classificationIdSchema,
	engineScoreMode,
	gameClassificationIdSchema,
	gameIdSchema,
	type ClassificationId,
	type GameClassificationId,
	type GameId,
} from "@playatlas/common/domain";
import {
	makeBaseRepository,
	type BaseRepositoryDeps,
	type IEntityRepositoryPort,
} from "@playatlas/common/infra";
import z from "zod";
import type { IGameClassificationMapperPort } from "../../application/scoring-engine/game-classification.mapper";
import type { GameClassification } from "../../domain/scoring-engine/game-classification.entity";
import type { GameClassificationRepositoryFilters } from "./game-classification.repository.types";

export const gameClassificationSchema = z.object({
	Id: gameClassificationIdSchema,
	GameId: gameIdSchema,
	ClassificationId: classificationIdSchema,
	Score: z.number(),
	NormalizedScore: z.number(),
	Mode: z.enum(engineScoreMode),
	EngineVersion: z.string(),
	BreakdownJson: z.string(),
	LastUpdatedAt: ISODateSchema,
	CreatedAt: ISODateSchema,
	DeletedAt: ISODateSchema.nullable(),
	DeleteAfter: ISODateSchema.nullable(),
});

export type GameClassificationModel = z.infer<typeof gameClassificationSchema>;

export type IGameClassificationRepositoryPort = IEntityRepositoryPort<
	GameClassificationId,
	GameClassification,
	GameClassificationRepositoryFilters
> & {
	getLatestByGame: (
		filters?: GameClassificationRepositoryFilters,
	) => Map<GameId, Map<ClassificationId, GameClassification>>;
	cleanup: () => void;
};

export type GameClassificationRepositoryDeps = BaseRepositoryDeps & {
	gameClassificationMapper: IGameClassificationMapperPort;
};

export const makeGameClassificationRepository = ({
	getDb,
	gameClassificationMapper,
	logService,
}: GameClassificationRepositoryDeps): IGameClassificationRepositoryPort => {
	const TABLE_NAME = "game_classification";
	const COLUMNS = [
		"Id",
		"GameId",
		"ClassificationId",
		"Score",
		"NormalizedScore",
		"Mode",
		"EngineVersion",
		"BreakdownJson",
		"LastUpdatedAt",
		"CreatedAt",
		"DeletedAt",
		"DeleteAfter",
	] as const satisfies (keyof GameClassificationModel)[];

	const getWhereClauseAndParamsFromFilters = (filters?: GameClassificationRepositoryFilters) => {
		const where: string[] = [];
		const params: (string | number)[] = [];

		if (!filters) {
			return { where: "", params };
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

	const base = makeBaseRepository({
		getDb,
		logService,
		config: {
			tableName: TABLE_NAME,
			idColumn: "Id",
			insertColumns: COLUMNS,
			updateColumns: COLUMNS.filter((c) => c !== "Id"),
			mapper: gameClassificationMapper,
			modelSchema: gameClassificationSchema,
			getWhereClauseAndParamsFromFilters,
			getOrderBy: () => `ORDER BY LastUpdatedAt ASC, Id ASC`,
		},
	});

	const add: IGameClassificationRepositoryPort["add"] = (gameClassification) => {
		base._add(gameClassification);
	};

	const upsert: IGameClassificationRepositoryPort["upsert"] = (gameClassification) => {
		base._upsert(gameClassification);
	};

	const update: IGameClassificationRepositoryPort["update"] = (gameClassification) => {
		base._update(gameClassification);
	};

	const getLatestByGame: IGameClassificationRepositoryPort["getLatestByGame"] = (filters) => {
		const latest = new Map<GameId, Map<ClassificationId, GameClassification>>();

		for (const gc of base.public.all(filters)) {
			let classificationMap = latest.get(gc.getGameId());
			if (!classificationMap) {
				classificationMap = new Map();
				latest.set(gc.getGameId(), classificationMap);
			}
			classificationMap.set(gc.getClassificationId(), gc);
		}

		return latest;
	};

	const cleanup: IGameClassificationRepositoryPort["cleanup"] = () => {
		base.run(() => {
			base.runSavePoint(({ db }) => {
				const classificationIdColumn: keyof GameClassificationModel = "ClassificationId";
				const placeholders = CLASSIFICATION_IDS.map(() => `?`);
				const stmt = db.prepare(
					`DELETE FROM ${TABLE_NAME} WHERE ${classificationIdColumn} NOT IN (${placeholders})`,
				);
				stmt.run(...CLASSIFICATION_IDS);
			});
		}, "cleanup()");
	};

	return {
		...base.public,
		add,
		upsert,
		update,
		getLatestByGame,
		cleanup,
	};
};
