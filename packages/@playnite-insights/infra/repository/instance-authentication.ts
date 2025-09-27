import { type InstanceAuthenticationRepository } from "@playnite-insights/core";
import { instanceAuthenticationSchema } from "@playnite-insights/lib/client";
import {
  getDefaultRepositoryDeps,
  repositoryCall,
  type BaseRepositoryDeps,
} from "./base";

export const makeInstanceAuthenticationRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): InstanceAuthenticationRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = "instance_authentication";

  const get: InstanceAuthenticationRepository["get"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM ${TABLE_NAME}`;
        const stmt = db.prepare(query);
        const result = stmt.get();
        if (!result) return null;
        const entry = instanceAuthenticationSchema.parse(result);
        return entry;
      },
      `get()`
    );
  };

  const set: InstanceAuthenticationRepository["set"] = (auth) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO ${TABLE_NAME} (
            Id,
            PasswordHash,
            Salt,
            CreatedAt,
            LastUpdatedAt
          ) VALUES (
            ?, ?, ?, ?, ?
          );
        `;
        const stmt = db.prepare(query);
        const now = new Date();
        auth.Id = 1;
        auth.CreatedAt = now.toISOString();
        auth.LastUpdatedAt = now.toISOString();
        stmt.run(
          auth.Id,
          auth.PasswordHash,
          auth.Salt,
          auth.CreatedAt,
          auth.LastUpdatedAt
        );
      },
      `set()`
    );
  };

  return { get, set };
};
