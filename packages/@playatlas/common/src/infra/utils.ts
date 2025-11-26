import { DatabaseSync } from "node:sqlite";
import type { LogService } from "../domain/log-service.types";
import { MakeRepositoryBaseDeps } from "./types";

const PERFORMANCE_WARN_THRESHOLD_MS = 50;

/**
 * @deprecated
 */
export const repositoryCall = <T>(
  logService: LogService,
  fn: () => T,
  context?: string
): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    const message = `Repository call ${
      context ? context : ""
    } took ${duration.toFixed(1)}ms`;
    if (duration >= PERFORMANCE_WARN_THRESHOLD_MS) logService.warning(message);
    else logService.debug(message);
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

export const repositoryTransaction = (props: {
  db: DatabaseSync;
  fn: () => void;
}) => {
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

export const repositoryRun = <T>(props: {
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

export const makeRepositoryBase = ({
  getDb,
  logService,
}: MakeRepositoryBaseDeps) => {
  return {
    runTransaction: (fn: () => void) =>
      repositoryTransaction({ db: getDb(), fn }),
    run: <T>(
      fn: (props: { db: DatabaseSync }) => T,
      context?: string,
      shouldLog?: boolean
    ) => repositoryRun({ logService, fn, context, shouldLog, db: getDb() }),
  };
};
