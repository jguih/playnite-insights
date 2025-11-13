import type { FileSystemService, LogService } from "@playnite-insights/core";
import { DatabaseSync } from "node:sqlite";
import { join } from "path";
import { exit } from "process";

type InitDatabaseDeps = {
  fileSystemService: FileSystemService;
  db: DatabaseSync;
  MIGRATIONS_DIR: string;
  logService: LogService;
};

const shouldSeedDb = () =>
  process.env.TEST_DATA === "true" &&
  (process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "testing");

export const initDatabase = async ({
  db,
  MIGRATIONS_DIR,
  logService,
  fileSystemService,
}: InitDatabaseDeps) => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS __migrations (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        AppliedAt DATETIME NOT NULL
      );
    `);
  } catch (error) {
    logService.error(`Failed to create migrations table`, error as Error);
    exit(1);
  }
  logService.info(`Initializing database...`);
  try {
    // Get applied migrations
    const applied =
      db
        .prepare(`SELECT Name FROM __migrations;`)
        .all()
        ?.map((e) => e.Name as string) ?? [];
    // Read all sql files in migrations folder
    const entries = await fileSystemService.readdir(MIGRATIONS_DIR, {
      withFileTypes: true,
    });
    const migrationFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((entry) => entry.endsWith(".sql"));
    let migrationsApplied = 0;
    // Apply missing migrations
    for (const fileName of migrationFiles) {
      if (applied.includes(fileName)) continue;
      logService.debug(`Applying migration ${fileName}...`);
      const absolutePath = join(MIGRATIONS_DIR, fileName);
      const sqlContents = await fileSystemService.readfile(
        absolutePath,
        "utf-8"
      );
      db.exec(sqlContents);
      db.prepare(
        `INSERT INTO __migrations (Name, AppliedAt) VALUES (?, datetime('now'))`
      ).run(fileName);
      logService.debug(`Migration applied ${fileName}`);
      migrationsApplied++;
    }
    logService.info(`Applied ${migrationsApplied} migrations`);
    logService.success(`Database initialized`);
  } catch (error) {
    logService.error("Failed to initialize database", error as Error);
    exit(1);
  }
};
