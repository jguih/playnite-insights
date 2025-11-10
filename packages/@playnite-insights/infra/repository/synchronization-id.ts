import type { SynchronizationIdRepository } from "@playnite-insights/core";
import { synchronizationIdSchema } from "@playnite-insights/lib/client";
import { repositoryCall, type BaseRepositoryDeps } from "./base";

export const makeSynchronizationIdRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): SynchronizationIdRepository => {
  const TABLE_NAME = "synchronization_id";

  const get: SynchronizationIdRepository["get"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const now = new Date();
        const query = `SELECT * FROM ${TABLE_NAME} WHERE Id = 1`;
        const stmt = db.prepare(query);
        const result = stmt.get();
        if (!result) return null;
        db.prepare(`UPDATE ${TABLE_NAME} SET LastUsedAt = ? WHERE Id = 1`).run(
          now.toISOString()
        );
        const entry = synchronizationIdSchema.parse(result);
        entry.LastUsedAt = now.toISOString();
        return entry;
      },
      `get()`
    );
  };

  const set: SynchronizationIdRepository["set"] = (syncId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO ${TABLE_NAME} (
            Id,
            SyncId,
            CreatedAt,
            LastUsedAt
          ) VALUES (
            ?, ?, ?, ?
          ) ON CONFLICT(Id) DO UPDATE SET
            SyncId = excluded.SyncId,
            CreatedAt = excluded.CreatedAt,
            LastUsedAt = excluded.LastUsedAt;
        `;
        const stmt = db.prepare(query);
        const now = new Date();
        syncId.Id = 1;
        syncId.CreatedAt = now.toISOString();
        syncId.LastUsedAt = now.toISOString();
        stmt.run(syncId.Id, syncId.SyncId, syncId.CreatedAt, syncId.LastUsedAt);
      },
      `set()`
    );
  };

  return { get, set };
};
