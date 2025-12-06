import { ISODateSchema } from "@playatlas/common/common";
import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { extensionRegistrationStatus } from "../domain/extension-registration.constants";
import {
  ExtensionRegistration,
  ExtensionRegistrationId,
} from "../domain/extension-registration.entity";
import { extensionRegistrationMapper } from "../extension-registration.mapper";
import { ExtensionRegistrationRepository } from "./extension-registration.repository.port";

export const extensionRegistrationSchema = z.object({
  Id: z.number(), // AUTO-INCREMENT
  ExtensionId: z.string(),
  PublicKey: z.string(),
  Hostname: z.string().nullable(),
  Os: z.string().nullable(),
  ExtensionVersion: z.string().nullable(),
  Status: z.nativeEnum(extensionRegistrationStatus),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});

export type ExtensionRegistrationModel = z.infer<
  typeof extensionRegistrationSchema
>;

export const makeExtensionRegistrationRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): ExtensionRegistrationRepository => {
  const TABLE_NAME = `extension_registration`;
  const COLUMNS: (keyof ExtensionRegistrationModel)[] = [
    "Id",
    "ExtensionId",
    "PublicKey",
    "Hostname",
    "Os",
    "ExtensionVersion",
    "Status",
    "CreatedAt",
    "LastUpdatedAt",
  ];
  const base = makeBaseRepository<
    ExtensionRegistrationId,
    ExtensionRegistration,
    ExtensionRegistrationModel
  >({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS.slice(1),
      updateColumns: COLUMNS.filter((c) => c !== "Id" && c !== "CreatedAt"),
      mapper: extensionRegistrationMapper,
      modelSchema: extensionRegistrationSchema,
    },
  });

  const add: ExtensionRegistrationRepository["add"] = (entity) => {
    const results = base.add(entity);
    for (const [entity, model, { lastInsertRowid }] of results)
      entity.setId(lastInsertRowid as ExtensionRegistrationId);
  };

  const update: ExtensionRegistrationRepository["update"] = base.update;

  const getByExtensionId: ExtensionRegistrationRepository["getByExtensionId"] =
    (extensionId) => {
      const query = `SELECT * FROM ${TABLE_NAME} WHERE ExtensionId = ?`;
      return base.run(({ db }) => {
        const stmt = db.prepare(query);
        const result = stmt.get(extensionId);
        if (!result) return null;
        const extensionRegistration = extensionRegistrationSchema.parse(result);
        return extensionRegistrationMapper.toDomain(extensionRegistration);
      }, `getByExtensionId(${extensionId})`);
    };

  const getById: ExtensionRegistrationRepository["getById"] = (id) => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE Id = ?`;
    return base.run(({ db }) => {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      if (!result) return null;
      const extensionRegistration = extensionRegistrationSchema.parse(result);
      return extensionRegistrationMapper.toDomain(extensionRegistration);
    }, `getByRegistrationId(${id})`);
  };

  const remove: ExtensionRegistrationRepository["remove"] = (id) => {
    return base.run(({ db }) => {
      const query = `DELETE FROM ${TABLE_NAME} WHERE Id = ?;`;
      const stmt = db.prepare(query);
      stmt.run(id);
      logService.debug(`Deleted extension registration (${id})`);
    }, `remove(${id})`);
  };

  const all: ExtensionRegistrationRepository["all"] = base.all;

  return {
    add,
    update,
    getByExtensionId,
    getById,
    remove,
    all,
  };
};
