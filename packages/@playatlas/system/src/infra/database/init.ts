import type { FileSystemService, LogService } from "@playatlas/common/domain";
import { DatabaseSync } from "node:sqlite";
import { basename, join } from "path";
import { exit } from "process";

const MIGRATIONS_TABLE_NAME = "__migrations";

const createMigrationsTable = (db: DatabaseSync): void => {
  db.exec(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE_NAME} (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        AppliedAt DATETIME NOT NULL
      );
    `);
};

const getAppliedMigrations = (db: DatabaseSync): string[] => {
  return (
    db
      .prepare(`SELECT Name FROM ${MIGRATIONS_TABLE_NAME};`)
      .all()
      ?.map((e) => e.Name as string) ?? []
  );
};

const getMigrationFilesAsync = async (deps: {
  fileSystemService: FileSystemService;
  migrationsDir: string;
}): Promise<string[]> => {
  const { fileSystemService, migrationsDir } = deps;
  const entries = await fileSystemService.readdir(migrationsDir, {
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((entry) => entry.endsWith(".sql"));
};

const applyMigrationAsync = async (deps: {
  db: DatabaseSync;
  sqlFilePath: string;
  fileSystemService: FileSystemService;
}): Promise<void> => {
  const { db, fileSystemService, sqlFilePath } = deps;
  const fileName = basename(sqlFilePath);
  const sqlContents = await fileSystemService.readfile(sqlFilePath, "utf-8");
  db.exec(sqlContents);
  db.prepare(
    `INSERT INTO __migrations (Name, AppliedAt) VALUES (?, datetime('now'))`
  ).run(fileName);
};

type InitDatabaseDeps = {
  db: DatabaseSync;
  fileSystemService: FileSystemService;
  logService: LogService;
  migrationsDir: string;
};

export const initDatabase = async ({
  db,
  logService,
  fileSystemService,
  migrationsDir,
}: InitDatabaseDeps) => {
  logService.info(`Initializing database...`);

  try {
    createMigrationsTable(db);
  } catch (error) {
    logService.error(`Failed to create migrations table`, error);
    exit(1);
  }

  try {
    const applied = getAppliedMigrations(db);
    const migrationFiles = await getMigrationFilesAsync({
      fileSystemService,
      migrationsDir,
    });
    let migrationsApplied = 0;
    // Apply missing migrations
    for (const fileName of migrationFiles) {
      if (applied.includes(fileName)) continue;
      logService.debug(`Applying migration ${fileName}...`);
      const sqlFilePath = join(migrationsDir, fileName);
      await applyMigrationAsync({ db, fileSystemService, sqlFilePath });
      logService.debug(`Migration applied ${fileName}`);
      migrationsApplied++;
    }
    logService.debug(`Applied ${migrationsApplied} migrations`);
    logService.success(`Database initialized`);
  } catch (error) {
    logService.error("Failed to initialize database", error);
    exit(1);
  }
};
