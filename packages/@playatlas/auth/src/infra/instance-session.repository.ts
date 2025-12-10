import { ISODateSchema } from "@playatlas/common/common";
import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { instanceSessionMapper } from "../instance-session.mapper";
import { InstanceSessionRepository } from "./instance-session.repository.port";

export const instanceSessionSchema = z.object({
  Id: z.string(),
  CreatedAt: ISODateSchema,
  LastUsedAt: ISODateSchema,
});

export type InstanceSessionModel = z.infer<typeof instanceSessionSchema>;

export const makeInstanceSessionRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): InstanceSessionRepository => {
  const TABLE_NAME = "instance_sessions";
  const COLUMNS = Object.keys(
    instanceSessionSchema.shape
  ) as (keyof InstanceSessionModel)[];
  const base = makeBaseRepository({
    getDb,
    logService,
    config: {
      modelSchema: instanceSessionSchema,
      mapper: instanceSessionMapper,
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: ["LastUsedAt"],
    },
  });

  const add: InstanceSessionRepository["add"] = (entity) => {
    base._add(entity);
  };

  const upsert: InstanceSessionRepository["upsert"] = (entity) => {
    base._upsert(entity);
  };

  const update: InstanceSessionRepository["update"] = (entity) => {
    base._update(entity);
  };

  return {
    ...base.public,
    add,
    upsert,
    update,
  };
};
