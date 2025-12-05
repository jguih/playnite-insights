import { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { LogService } from "../application/log-service.port";
import { BaseEntity, BaseEntityId } from "../domain/base-entity";
import { BaseRepositoryPort } from "./base-repository.port";
import { MakeRepositoryBaseDeps } from "./base-repository.types";

const PERFORMANCE_WARN_THRESHOLD_MS = 50;

const baseRunTransaction = (props: { db: DatabaseSync; fn: () => void }) => {
  const { db, fn } = props;
  db.exec("BEGIN TRANSACTION");
  try {
    fn();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const baseRun = <T>(props: {
  db: DatabaseSync;
  fn: (props: { db: DatabaseSync }) => T;
  logService: LogService;
  shouldLog?: boolean;
  context?: string;
}) => {
  const { db, fn, logService, shouldLog, context } = props;
  const start = performance.now();
  try {
    const result = fn({ db });
    const duration = performance.now() - start;
    const message = `Repository call ${
      context ? context : ""
    } took ${duration.toFixed(1)}ms`;
    if (shouldLog) {
      if (duration >= PERFORMANCE_WARN_THRESHOLD_MS)
        logService.warning(message);
      else logService.debug(message);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logService.error(
      `Repository call ${
        context ? context : ""
      } failed after ${duration.toFixed(1)}ms`,
      error
    );
    throw error;
  }
};

export const makeRepositoryBase = <
  TEntityId extends BaseEntityId,
  TEntity extends BaseEntity<TEntityId>,
  TPersistence
>({
  getDb,
  logService,
  config,
}: MakeRepositoryBaseDeps<TEntity, TPersistence>): BaseRepositoryPort<
  TEntity,
  TPersistence
> => {
  const { tableName, idColumn, insertColumns, updateColumns, toPersistence } =
    config;

  const insertSql = `
    INSERT INTO ${tableName}
      (${insertColumns.join(", ")})
    VALUES
      (${insertColumns.map(() => "?").join(", ")});
  `;

  const updateSql = `
    UPDATE ${tableName}
    SET ${updateColumns.map((s) => `${String(s)} = ?`).join(", ")}
    WHERE ${String(idColumn)} = ?
  `;

  const run: BaseRepositoryPort<TEntity, TPersistence>["run"] = (
    fn,
    context,
    shouldLog
  ) => {
    const db = getDb();
    return baseRun({ logService, fn, context, shouldLog, db });
  };

  const runTransaction: BaseRepositoryPort<
    TEntity,
    TPersistence
  >["runTransaction"] = (fn) => {
    const db = getDb();
    return baseRunTransaction({ db, fn });
  };

  const add: BaseRepositoryPort<TEntity, TPersistence>["add"] = ({
    entity,
    toPersistence: toPersistenceOverride,
  }) => {
    const entities = Array.isArray(entity) ? entity : [entity];

    return run(({ db }) => {
      const stmt = db.prepare(insertSql);
      const results: Array<
        [TEntity, TPersistence & { lastInsertRowid: number | bigint }]
      > = [];

      for (const entity of entities) {
        entity.validate();
        const model = (toPersistenceOverride ?? toPersistence)(entity);
        const params = insertColumns.map((col) => model[col]);
        const { lastInsertRowid } = stmt.run(...(params as SQLInputValue[]));
        results.push([entity, { ...model, lastInsertRowid }]);
      }
      return results;
    }, "add()");
  };

  const update: BaseRepositoryPort<TEntity, TPersistence>["update"] = ({
    entity,
    toPersistence: toPersistenceOverride,
  }) => {
    return run(({ db }) => {
      entity.validate();
      const stmt = db.prepare(updateSql);
      const model = (toPersistenceOverride ?? toPersistence)(entity);
      const params = updateColumns.map((col) => model[col]);
      stmt.run(...(params as SQLInputValue[]), entity.getId());
      return model;
    });
  };

  return {
    runTransaction,
    run,
    add,
    update,
  };
};
