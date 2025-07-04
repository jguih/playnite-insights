import { DatabaseSync } from "node:sqlite"
import { DB_FILE, FILES_DIR, logInfo, logSuccess } from "./config.js";
import { exit } from "process";
import { readdir, rm } from "fs/promises";
import { join } from "path";

/**
 * 
 * @param {DatabaseSync} db 
 */
const purge = async (db) => {
  // Clear database (except time sensitive tables)
  logInfo(`Purging database...`)
  db.prepare(`DELETE FROM playnite_game WHERE 1=1`).run();
  db.prepare(`DELETE FROM publisher WHERE 1=1`).run();
  db.prepare(`DELETE FROM developer WHERE 1=1`).run();
  db.prepare(`DELETE FROM genre WHERE 1=1`).run();
  db.prepare(`DELETE FROM platform WHERE 1=1`).run();
  logSuccess(`Database purged`);
  // Clear all media files
  logInfo(`Cleaning up library media files...`);
  const entries = await readdir(FILES_DIR, { withFileTypes: true });
	const libraryFolders = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);
  for (const folderName of libraryFolders) {
    const folderPath = join(FILES_DIR, folderName);
    await rm(folderPath, { recursive:true, force:true });
    logInfo(`Folder ${folderPath} deleted`);
  }
  logSuccess(`Cleaned all media files`);
};

const db = new DatabaseSync(DB_FILE, { enableForeignKeyConstraints: true });
await purge(db);
db.close()

exit(0);