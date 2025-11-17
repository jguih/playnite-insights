import {
  type BaseRepositoryDeps,
  repositoryCall,
} from "@playatlas/common/infra";
import z from "zod";
import { completionStatusMapper } from "../completion-status.mapper";
import { CompletionStatus } from "../domain/completion-status.entity";
import type { CompletionStatusRepository } from "./completion-status.repository.port";

export const completionStatusSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export type CompletionStatusModel = z.infer<typeof completionStatusSchema>;

export const makeCompletionStatusRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): CompletionStatusRepository => {
  const db = getDb();
  const TABLE_NAME = `completion_status`;

  const add: CompletionStatusRepository["add"] = (completionStatus) => {
    return repositoryCall(
      logService,
      () => {
        const query = `
          INSERT INTO ${TABLE_NAME}
            (Id, Name)
          VALUES
            (?, ?)
        `;
        const model = completionStatusMapper.toPersistence(completionStatus);
        const stmt = db.prepare(query);
        stmt.run(model.Id, model.Name);
        logService.debug(`Created Completion Status ${model.Name}`);
      },
      `add(${completionStatus.getId()}, ${completionStatus.getName()})`
    );
  };

  const upsertMany: CompletionStatusRepository["upsertMany"] = (
    completionStatuses
  ) => {
    return repositoryCall(
      logService,
      () => {
        const query = `
            INSERT INTO ${TABLE_NAME}
              (Id, Name)
            VALUES
              (?, ?)
            ON CONFLICT DO UPDATE SET
              Name = excluded.Name;
            `;
        const stmt = db.prepare(query);
        db.exec("BEGIN TRANSACTION");
        try {
          for (const completionStatus of completionStatuses) {
            const model =
              completionStatusMapper.toPersistence(completionStatus);
            stmt.run(model.Id, model.Name);
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `upsertMany(${completionStatuses.length} completionStatus(es))`
    );
  };

  const update: CompletionStatusRepository["update"] = (completionStatus) => {
    return repositoryCall(
      logService,
      () => {
        const query = `
        UPDATE ${TABLE_NAME}
        SET
          Name = ?
        WHERE Id = ?;
        `;
        const model = completionStatusMapper.toPersistence(completionStatus);
        const stmt = db.prepare(query);
        stmt.run(model.Name, model.Id);
        logService.debug(`Updated completionStatus ${model.Name}`);
      },
      `update(${completionStatus.getId()}, ${completionStatus.getName()})`
    );
  };

  const getById: CompletionStatusRepository["getById"] = (id) => {
    return repositoryCall(
      logService,
      () => {
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
        return completionStatus
          ? completionStatusMapper.toDomain(completionStatus)
          : null;
      },
      `getById(${id})`
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
        const models = z.array(completionStatusSchema).parse(result);
        const completionStatuses: CompletionStatus[] = [];
        for (const model of models)
          completionStatuses.push(completionStatusMapper.toDomain(model));
        logService.debug(
          `Found ${completionStatuses?.length ?? 0} completion status(es)`
        );
        return completionStatuses;
      },
      `all()`
    );
  };

  return {
    add,
    upsertMany,
    update,
    getById,
    all,
  };
};
