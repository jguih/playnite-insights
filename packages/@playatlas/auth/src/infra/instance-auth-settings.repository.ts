import { ISODateSchema } from "@playatlas/common/common";
import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { instanceAuthSettingsMapper } from "../instance-auth-settings.mapper";
import { InstanceAuthSettingsRepository } from "./instance-auth-settings.repository.port";

export const instanceAuthSettingsSchema = z.object({
  Id: z.literal(1),
  PasswordHash: z.string(),
  Salt: z.string(),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});

export type InstanceAuthSettingsModel = z.infer<
  typeof instanceAuthSettingsSchema
>;

export const makeInstanceAuthenticationRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): InstanceAuthSettingsRepository => {
  const TABLE_NAME = "instance_authentication";
  const COLUMNS: (keyof InstanceAuthSettingsModel)[] = [
    "Id",
    "LastUpdatedAt",
    "CreatedAt",
    "PasswordHash",
    "Salt",
  ];
  const base = makeBaseRepository({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      mapper: instanceAuthSettingsMapper,
      modelSchema: instanceAuthSettingsSchema,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: COLUMNS.filter((c) => c !== "Id"),
    },
  });

  const upsert: InstanceAuthSettingsRepository["upsert"] = (entity) => {
    base._upsert(entity);
  };

  return { ...base.public, upsert };
};
