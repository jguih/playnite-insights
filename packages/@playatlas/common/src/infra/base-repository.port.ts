import { DatabaseSync } from "node:sqlite";

type ToPersistenceFnOverride<TEntity, TPersistence> = {
  toPersistence?: (entity: TEntity) => TPersistence;
};

export type BaseRepositoryPort<TEntity, TPersistence> = {
  add: (
    entity: TEntity | TEntity[],
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => Array<[TEntity, TPersistence, { lastInsertRowid: number | bigint }]>;
  update: (
    entity: TEntity,
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => TPersistence;
  all: () => TEntity[];
  run: <T>(
    fn: (props: { db: DatabaseSync }) => T,
    context?: string,
    shouldLog?: boolean
  ) => T;
  runTransaction: (fn: () => void) => void;
};
