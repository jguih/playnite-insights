import { ISODateSchema } from "@playatlas/common/common";
import {
  BaseRepositoryDeps,
  makeRepositoryBase,
} from "@playatlas/common/infra";
import z from "zod";
import { extensionRegistrationStatus } from "../domain/extension-registration.constants";
import { ExtensionRegistration } from "../domain/extension-registration.entity";
import { extensionRegistrationMapper } from "../extension-registration.mapper";
import { ExtensionRegistrationRepository } from "./extension-registration.repository.port";

export const extensionRegistrationSchema = z.object({
  Id: z.number(),
  ExtensionId: z.string(),
  PublicKey: z.string(),
  Hostname: z.string().nullable(),
  Os: z.string().nullable(),
  ExtensionVersion: z.string().nullable(),
  Status: z.nativeEnum(extensionRegistrationStatus),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});

export const extensionRegistrationInsertSchema =
  extensionRegistrationSchema.omit({ Id: true });

export type ExtensionRegistrationModel = z.infer<
  typeof extensionRegistrationSchema
>;
export type ExtensionRegistrationModelInsert = z.infer<
  typeof extensionRegistrationInsertSchema
>;

export const makeExtensionRegistrationRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): ExtensionRegistrationRepository => {
  const base = makeRepositoryBase({ getDb, logService });
  const TABLE_NAME = `extension_registration`;

  const add: ExtensionRegistrationRepository["add"] = (registration) => {
    registration.validate();
    const query = `
      INSERT INTO ${TABLE_NAME} (
        ExtensionId,
        PublicKey,
        Hostname,
        Os,
        ExtensionVersion,
        Status,
        CreatedAt,
        LastUpdatedAt
      ) VALUES
        (?,?,?,?,?,?,?,?)
    `;
    return base.run(({ db }) => {
      const now = new Date();
      const registrationModel = extensionRegistrationMapper.toPersistence({
        entity: registration,
        createdAt: now,
        lastUpdatedAt: now,
      });

      extensionRegistrationInsertSchema.parse(registrationModel);

      const stmt = db.prepare(query);
      const result = stmt.run(
        registrationModel.ExtensionId,
        registrationModel.PublicKey,
        registrationModel.Hostname,
        registrationModel.Os,
        registrationModel.ExtensionVersion,
        registrationModel.Status,
        registrationModel.CreatedAt,
        registrationModel.LastUpdatedAt
      );

      registration.applyPersistenceMetadata({
        id: result.lastInsertRowid as number,
        createdAt: now,
        lastUpdatedAt: now,
      });
    }, `add(${registration.getExtensionId()}, ${registration.getHostname()})`);
  };

  const update: ExtensionRegistrationRepository["update"] = (registration) => {
    registration.validate();
    const query = `
      UPDATE ${TABLE_NAME}
      SET
        ExtensionId = ?,
        PublicKey = ?,
        Hostname = ?,
        Os = ?,
        ExtensionVersion = ?,
        Status = ?,
        LastUpdatedAt = ?
      WHERE Id = ?
    `;
    return base.run(({ db }) => {
      const now = new Date();
      const registrationModel = extensionRegistrationMapper.toPersistence({
        entity: registration,
        createdAt: registration.getCreatedAt(),
        lastUpdatedAt: now,
      });

      extensionRegistrationInsertSchema.parse(registrationModel);

      const stmt = db.prepare(query);
      stmt.run(
        registrationModel.ExtensionId,
        registrationModel.PublicKey,
        registrationModel.Hostname,
        registrationModel.Os,
        registrationModel.ExtensionVersion,
        registrationModel.Status,
        registrationModel.LastUpdatedAt,
        registration.getId()
      );

      registration.applyPersistenceMetadata({
        id: registration.getId(),
        createdAt: registration.getCreatedAt(),
        lastUpdatedAt: now,
      });
    }, `update(${registration.getId()}, ${registration.getExtensionId()})`);
  };

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

  const all: ExtensionRegistrationRepository["all"] = () => {
    return base.run(({ db }) => {
      const query = `SELECT * FROM ${TABLE_NAME} ORDER BY Id DESC`;
      const stmt = db.prepare(query);
      const result = stmt.all();
      const registrationModels = z
        .array(extensionRegistrationSchema)
        .parse(result);

      const registrations: ExtensionRegistration[] = [];
      for (const model of registrationModels)
        registrations.push(extensionRegistrationMapper.toDomain(model));

      logService.debug(`Found ${registrations?.length ?? 0} registrations`);
      return registrations;
    }, `all()`);
  };

  return {
    add,
    update,
    getByExtensionId,
    getById,
    remove,
    all,
  };
};
