import type { DatabaseSync } from "node:sqlite";
import { ZodSchema } from "zod";
import { EntityMapper } from "../application";
import type { LogService } from "../application/log-service.port";

export type BaseRepositoryConfig<TEntity, TPersistence> = {
  tableName: string;
  idColumn: keyof TPersistence;
  insertColumns: (keyof TPersistence)[];
  updateColumns: (keyof TPersistence)[];
  modelSchema: ZodSchema<TPersistence>;
  mapper: EntityMapper<TEntity, TPersistence>;
  autoIncrementId?: boolean;
};

export type BaseRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export type MakeBaseRepositoryDeps<TEntity, TPersistence> =
  BaseRepositoryDeps & {
    config: BaseRepositoryConfig<TEntity, TPersistence>;
  };
