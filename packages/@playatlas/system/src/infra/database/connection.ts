import { DatabaseSync } from "node:sqlite";

export type MakeDatabaseConnectionDeps =
  | {
      inMemory?: false;
      /**
       * Path to the database file
       */
      path: string;
    }
  | {
      inMemory: true;
      path?: null;
    };

export const makeDatabaseConnection = ({
  path,
  inMemory,
}: MakeDatabaseConnectionDeps): DatabaseSync => {
  const dbPath = inMemory ? ":memory:" : path;
  db = new DatabaseSync(dbPath, {
    enableForeignKeyConstraints: true,
  });
  return db;
};

let db: DatabaseSync | null = null;

export const getDatabaseConnection = (
  deps: MakeDatabaseConnectionDeps
): DatabaseSync => {
  if (db === null) {
    db = makeDatabaseConnection(deps);
  }
  return db;
};
