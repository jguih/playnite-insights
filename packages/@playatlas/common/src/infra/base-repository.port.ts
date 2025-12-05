import { DatabaseSync } from "node:sqlite";

export type BaseRepositoryPort<TEntity, TPersistence> = {
  add: (props: {
    entity: TEntity | TEntity[];
    toPersistence?: (entity: TEntity) => TPersistence;
  }) => Array<[TEntity, TPersistence & { lastInsertRowid: number | bigint }]>;
  update: (props: {
    entity: TEntity;
    toPersistence?: (entity: TEntity) => TPersistence;
  }) => TPersistence;
  run: <T>(
    fn: (props: { db: DatabaseSync }) => T,
    context?: string,
    shouldLog?: boolean
  ) => T;
  runTransaction: (fn: () => void) => void;
};
