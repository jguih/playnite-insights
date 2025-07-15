import { join } from "path";

const workDir = process.env.WORK_DIR || "/app";
const dataDir = `${workDir}/data`;

export const DATA_DIR = dataDir;
export const PLAYNITE_GAMES_JSON_FILE = join(dataDir, "/games.json");
export const LIBRARY_MANIFEST_FILE = join(dataDir, "/manifest.json");
export const TMP_DIR = join(dataDir, "/tmp");
export const FILES_DIR = join(dataDir, "/files");
export const DB_FILE = join(dataDir, "/db");
export const CONTENT_HASH_FILE_NAME = "contentHash.txt";
export const MIGRATIONS_DIR = join(workDir, "/infra/migrations");
