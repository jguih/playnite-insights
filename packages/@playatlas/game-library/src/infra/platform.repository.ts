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

  const add: PlatformRepository["add"] = (platform) => base.add(platform);

  const upsert: PlatformRepository["upsert"] = (platform) =>
    base.upsert(platform);

  const exists: PlatformRepository["exists"] = (id) => base.exists(id);

  const update: PlatformRepository["update"] = (platform) =>
    base.update(platform);

  const getById: PlatformRepository["getById"] = (id) => base.getById(id);

  const all: PlatformRepository["all"] = () => base.all();

  const remove: PlatformRepository["remove"] = (id) => base.remove(id);

  return {
    add,
    upsert,
    update,
    exists,
    getById,
    all,
    remove,
  };
};
