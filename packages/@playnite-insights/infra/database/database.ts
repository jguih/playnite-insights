import { DatabaseSync } from "node:sqlite";

export type GetDbDeps =
  | {
      /**
       * If `true` will use a in memory SQLite database
       */
      inMemory: true;
      path?: undefined;
    }
  | {
      inMemory?: false;
      path: string;
    };

let db: DatabaseSync | null = null;

export const getDb = (deps: GetDbDeps): DatabaseSync => {
  const dbPath = deps.inMemory ? ":memory:" : deps.path;
  if (db === null) {
    db = new DatabaseSync(dbPath, {
      enableForeignKeyConstraints: true,
    });
  }
  return db;
};
