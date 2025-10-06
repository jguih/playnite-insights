import { DatabaseSync } from "node:sqlite";
import { config } from "../config";

export type GetDbDeps = {
  /**
   * If `true` will use a in memory SQLite database
   */
  inMemory?: boolean;
};

let db: DatabaseSync | null = null;

export const getDb = ({ inMemory }: GetDbDeps = {}): DatabaseSync => {
  const dbPath = inMemory ? ":memory:" : config.DB_FILE;
  if (db === null) {
    db = new DatabaseSync(dbPath, {
      enableForeignKeyConstraints: true,
    });
  }
  return db;
};

export const getLastInsertId = (): string | undefined => {
  return getDb()
    .prepare("SELECT last_insert_rowid() as id")
    .get()
    ?.id?.toString();
};
