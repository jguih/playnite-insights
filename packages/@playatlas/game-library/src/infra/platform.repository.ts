import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { platformMapper } from "../platform.mapper";
import { PlatformRepository } from "./platform.repository.port";

export const platformSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  SpecificationId: z.string(),
  Icon: z.string().nullable(),
  Cover: z.string().nullable(),
  Background: z.string().nullable(),
});

export type PlatformModel = z.infer<typeof platformSchema>;

export const makePlatformRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): PlatformRepository => {
  const TABLE_NAME = "platform";
  const COLUMNS: (keyof PlatformModel)[] = [
    "Id",
    "Name",
    "SpecificationId",
    "Icon",
    "Cover",
    "Background",
  ];
  const base = makeBaseRepository({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: COLUMNS.filter((c) => c !== "Id"),
      mapper: platformMapper,
      modelSchema: platformSchema,
    },
  });

  const add: PlatformRepository["add"] = (platform) => {
    base._add(platform);
  };

  const upsert: PlatformRepository["upsert"] = (platform) => {
    base._upsert(platform);
  };

  const update: PlatformRepository["update"] = (platform) => {
    base._update(platform);
  };

  return {
    ...base.public,
    add,
    upsert,
    update,
  };
};
