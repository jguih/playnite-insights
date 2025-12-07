import { DatabaseSync } from "node:sqlite";
import { EntityRepository } from "./repository.types";

type ToPersistenceFnOverride<TEntity, TPersistence> = {
  toPersistence?: (entity: TEntity) => TPersistence;
};

export type BaseRepositoryPort<TEntityId, TEntity, TPersistence> = {
  public: Pick<
    EntityRepository<TEntityId, TEntity>,
    "all" | "remove" | "getById" | "exists"
  >;
  /**
   * Persists a new entity
   * @param entity The entity to persist
   * @param options Extra options to change the function's behavior
   * @returns An `array` with the persistence object and related entities
   */
  _add: (
    entity: TEntity | TEntity[],
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => Array<[TEntity, TPersistence, { lastInsertRowid: number | bigint }]>;
  /**
   * Updates an existing entity
   * @param entity The entity to update
   * @param options Extra options to change the function's behavior
   * @returns The persistence object
   */
  _update: (
    entity: TEntity,
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => TPersistence;
  /**
   * Persists a new entity, updating an existing one in case of conflict
   * @param entity The entity to persist
   * @param options Extra options to change the function's behavior
   * @returns An `array` with the persistence object and related entities
   */
  _upsert: (
    entity: TEntity | TEntity[],
    options?: ToPersistenceFnOverride<TEntity, TPersistence>
  ) => Array<[TEntity, TPersistence, { lastInsertRowid: number | bigint }]>;
  run: <T>(
    fn: (props: { db: DatabaseSync }) => T,
    context?: string,
    shouldLog?: boolean
  ) => T;
  runTransaction: (fn: () => void) => void;
};
