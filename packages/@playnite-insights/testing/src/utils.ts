import type { DatabaseSync } from "node:sqlite";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // copy to avoid mutating original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
}

function clearAllTables(db: DatabaseSync) {
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all()
    .map((t) => t.name);

  for (const table of tables) {
    db.exec(`DELETE FROM ${table};`);
  }
}

export const testUtils = { shuffleArray, clearAllTables };
