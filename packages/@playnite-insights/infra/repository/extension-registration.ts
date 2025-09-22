import { ExtensionRegistrationRepository } from "@playnite-insights/core";
import { extensionRegistrationSchema } from "@playnite-insights/lib/client";
import z from "zod";
import {
  BaseRepositoryDeps,
  getDefaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makeExtensionRegistrationRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): ExtensionRegistrationRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = `extension_registration`;

  const add: ExtensionRegistrationRepository["add"] = (data) => {
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
          now
        );
      },
      `add(${data.ExtensionId}, ${data.Hostname})`
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

  return { add, update, getByExtensionId };
};

export const defaultExtensionRegistrationRepository: ExtensionRegistrationRepository =
  makeExtensionRegistrationRepository();
