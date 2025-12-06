import { DatabaseSync } from "node:sqlite";

type ToPersistenceFnOverride<TEntity, TPersistence> = {
  toPersistence?: (entity: TEntity) => TPersistence;
};

export type BaseRepositoryPort<TEntityId, TEntity, TPersistence> = {
  /**
   * Persists a new entity
   * @param entity The entity to persist
   * @param options Extra options to change the function's behavior
   * @returns An `array` with the persistence object and related entities
   */
  add: (
    entity: TEntity | TEntity[],
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => Array<[TEntity, TPersistence, { lastInsertRowid: number | bigint }]>;
  /**
   * Updates an existing entity
   * @param entity The entity to update
   * @param options Extra options to change the function's behavior
   * @returns The persistence object
   */
  update: (
    entity: TEntity,
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => TPersistence;
  all: () => TEntity[];
  remove: (id: TEntityId) => void;
  getById: (id: TEntityId) => TEntity | null;
  /**
   * Persists a new entity, updating an existing one in case of conflict
   * @param entity The entity to persist
   * @param options Extra options to change the function's behavior
   * @returns An `array` with the persistence object and related entities
   */
  upsert: (
    entity: TEntity | TEntity[],
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => Array<[TEntity, TPersistence, { lastInsertRowid: number | bigint }]>;
  exists: (id: TEntityId) => boolean;
  run: <T>(
    fn: (props: { db: DatabaseSync }) => T,
    context?: string,
    shouldLog?: boolean
  ) => T;
  runTransaction: (fn: () => void) => void;
};
