import type { DatabaseSync } from "node:sqlite";
import type { LogService } from "../application/log-service.port";

export type RepositoryConfig<TEntity, TPersistence> = {
  tableName: string;
  idColumn: keyof TPersistence;
  insertColumns: (keyof TPersistence)[];
  updateColumns: (keyof TPersistence)[];
  toPersistence: (entity: TEntity) => TPersistence;
};

export type MakeRepositoryBaseDeps<TEntity, TPersistence> = {
  logService: LogService;
  getDb: () => DatabaseSync;
  config: RepositoryConfig<TEntity, TPersistence>;
};
