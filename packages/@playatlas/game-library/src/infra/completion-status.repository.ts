import {
  type BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { completionStatusMapper } from "../completion-status.mapper";
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
  const TABLE_NAME = `completion_status`;
  const COLUMNS: (keyof CompletionStatusModel)[] = ["Id", "Name"];
  const base = makeBaseRepository({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: COLUMNS.filter((c) => c !== "Id"),
      mapper: completionStatusMapper,
      modelSchema: completionStatusSchema,
    },
  });

  const add: CompletionStatusRepository["add"] = (completionStatus) =>
    base.add(completionStatus);

  const upsert: CompletionStatusRepository["upsert"] = (completionStatus) =>
    base.upsert(completionStatus);

  const update: CompletionStatusRepository["update"] = (completionStatus) =>
    base.update(completionStatus);

  const getById: CompletionStatusRepository["getById"] = (id) =>
    base.getById(id);

  const all: CompletionStatusRepository["all"] = () => base.all();

  const exists: CompletionStatusRepository["exists"] = (id) => base.exists(id);

  const remove: CompletionStatusRepository["remove"] = (id) => base.remove(id);

  return {
    add,
    upsert,
    update,
    getById,
    all,
    exists,
    remove,
  };
};
