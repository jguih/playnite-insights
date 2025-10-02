import { type ExtensionRegistrationRepository } from "@playnite-insights/core";
import { extensionRegistrationSchema } from "@playnite-insights/lib/client";
import z from "zod";
import {
  type BaseRepositoryDeps,
  getDefaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makeExtensionRegistrationRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): ExtensionRegistrationRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = `extension_registration`;

  const add: ExtensionRegistrationRepository["add"] = (newRegistration) => {
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
    return repositoryCall(
      logService,
      () => {
        const now = new Date().toISOString();
        newRegistration.CreatedAt = now;
        newRegistration.LastUpdatedAt = now;
        const db = getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(
          newRegistration.ExtensionId,
          newRegistration.PublicKey,
          newRegistration.Hostname,
          newRegistration.Os,
          newRegistration.ExtensionVersion,
          newRegistration.Status,
          newRegistration.CreatedAt,
          newRegistration.LastUpdatedAt
        );
        newRegistration.Id = result.lastInsertRowid as number;
      },
      `add(${newRegistration.ExtensionId}, ${newRegistration.Hostname})`
    );
  };

  const update: ExtensionRegistrationRepository["update"] = (data) => {
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
    return repositoryCall(
      logService,
      () => {
        const now = new Date().toISOString();
        const db = getDb();
        const stmt = db.prepare(query);
        stmt.run(
          data.ExtensionId,
          data.PublicKey,
          data.Hostname,
          data.Os,
          data.ExtensionVersion,
          data.Status,
          now,
          data.Id
        );
      },
      `update(${data.Id}, ${data.ExtensionId})`
    );
  };

  const getByExtensionId: ExtensionRegistrationRepository["getByExtensionId"] =
    (extensionId) => {
      const query = `SELECT * FROM ${TABLE_NAME} WHERE ExtensionId = ?`;
      return repositoryCall(
        logService,
        () => {
          const db = getDb();
          const stmt = db.prepare(query);
          const result = stmt.get(extensionId);
          const extensionRegistration = z
            .optional(extensionRegistrationSchema)
            .parse(result);
          return extensionRegistration ?? null;
        },
        `getByExtensionId(${extensionId})`
      );
    };

  const getByRegistrationId: ExtensionRegistrationRepository["getByRegistrationId"] =
    (id) => {
      const query = `SELECT * FROM ${TABLE_NAME} WHERE Id = ?`;
      return repositoryCall(
        logService,
        () => {
          const db = getDb();
          const stmt = db.prepare(query);
          const result = stmt.get(id);
          const extensionRegistration = z
            .optional(extensionRegistrationSchema)
            .parse(result);
          return extensionRegistration ?? null;
        },
        `getByRegistrationId(${id})`
      );
    };

  const remove: ExtensionRegistrationRepository["remove"] = (id) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM ${TABLE_NAME} WHERE Id = ?;`;
        const stmt = db.prepare(query);
        stmt.run(id);
        logService.debug(`Deleted extension registration (${id})`);
      },
      `remove(${id})`
    );
  };

  const all: ExtensionRegistrationRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM ${TABLE_NAME} ORDER BY Id DESC`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const registrations = z
          .array(extensionRegistrationSchema)
          .parse(result);
        logService.debug(`Found ${registrations?.length ?? 0} registrations`);
        return registrations;
      },
      `all()`
    );
  };

  return { add, update, getByExtensionId, getByRegistrationId, remove, all };
};

export const defaultExtensionRegistrationRepository: ExtensionRegistrationRepository =
  makeExtensionRegistrationRepository();
