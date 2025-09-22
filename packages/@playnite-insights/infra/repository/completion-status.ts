import { CompletionStatusRepository } from "@playnite-insights/core/src/types/completion-status.types";
import { completionStatusSchema } from "@playnite-insights/lib/client";
import z from "zod";
import {
  type BaseRepositoryDeps,
  getDefaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makeCompletionStatusRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): CompletionStatusRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = `completion_status`;

  const add: CompletionStatusRepository["add"] = (completionStatus) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
      INSERT INTO ${TABLE_NAME}
        (Id, Name)
      VALUES
        (?, ?)
      `;
        const stmt = db.prepare(query);
        stmt.run(completionStatus.Id, completionStatus.Name);
        logService.debug(`Created Completion Status ${completionStatus.Name}`);
        return true;
      },
      `add(${completionStatus.Id}, ${completionStatus.Name})`
    );
  };

  const update: CompletionStatusRepository["update"] = (completionStatus) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        UPDATE ${TABLE_NAME}
        SET
          Name = ?
        WHERE Id = ?;
        `;
        const stmt = db.prepare(query);
        stmt.run(completionStatus.Name, completionStatus.Id);
        logService.debug(`Updated completionStatus ${completionStatus.Name}`);
        return true;
      },
      `update(${completionStatus.Id}, ${completionStatus.Name})`
    );
  };

  const getById: CompletionStatusRepository["getById"] = (id) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
      SELECT *
      FROM ${TABLE_NAME}
      WHERE Id = ?;
    `;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const completionStatus = z
          .optional(completionStatusSchema)
          .parse(result);
        logService.debug(`Found Completion Status: ${completionStatus?.Name}`);
        return completionStatus;
      },
      `getById(${id})`
    );
  };

  const hasChanges: CompletionStatusRepository["hasChanges"] = (
    oldCompletionStatus,
    newCompletionStatus
  ) => {
    return (
      oldCompletionStatus.Id != newCompletionStatus.Id ||
      oldCompletionStatus.Name != newCompletionStatus.Name
    );
  };

  const all: CompletionStatusRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM ${TABLE_NAME} ORDER BY Name ASC`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const completionStatuses = z
          .optional(z.array(completionStatusSchema))
          .parse(result);
        logService.debug(
          `Found ${completionStatuses?.length ?? 0} completion statuses`
        );
        return completionStatuses;
      },
      `all()`
    );
  };

  return {
    add,
    update,
    getById,
    hasChanges,
    all,
  };
};

export const defaultCompletionStatusRepository: CompletionStatusRepository =
  makeCompletionStatusRepository();
