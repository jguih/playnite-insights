import { type InstanceSessionsRepository } from "@playnite-insights/core";
import { instanceSessionSchema } from "@playnite-insights/lib/client";
import { type BaseRepositoryDeps, repositoryCall } from "./base";

export const makeInstanceSessionsRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): InstanceSessionsRepository => {
  const TABLE_NAME = "instance_sessions";

  const add: InstanceSessionsRepository["add"] = (newSession) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `INSERT INTO ${TABLE_NAME} (Id, CreatedAt, LastUsedAt) VALUES (?, ?, ?)`;
        const stmt = db.prepare(query);
        const now = new Date();
        newSession.CreatedAt = newSession.LastUsedAt = now.toISOString();
        stmt.run(newSession.Id, newSession.CreatedAt, newSession.LastUsedAt);
        logService.debug(`Created instance session ${newSession.Id}`);
      },
      `add()`
    );
  };

  const getById: InstanceSessionsRepository["getById"] = (id) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const result = db
          .prepare(`SELECT * FROM ${TABLE_NAME} WHERE Id = ?`)
          .get(id);
        if (!result) return null;
        const session = instanceSessionSchema.parse(result);
        const now = new Date();
        db.prepare(`UPDATE ${TABLE_NAME} SET LastUsedAt = ? WHERE Id = ?`).run(
          now.toISOString(),
          session.Id
        );
        logService.debug(`Found session ${session.Id}`);
        return session;
      },
      `getById()`
    );
  };

  return { add, getById };
};
