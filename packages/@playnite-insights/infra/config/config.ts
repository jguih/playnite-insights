import { join } from "path";

const workDir = "/app";
const dataDir = process.env.PLAYATLAS_DATA_DIR || `${workDir}/data`;

export const DATA_DIR = dataDir;

/** @deprecated */
export const PLAYNITE_GAMES_JSON_FILE = join(dataDir, "/games.json");

export const LIBRARY_MANIFEST_FILE = join(dataDir, "/manifest.json");
export const TMP_DIR = join(dataDir, "/tmp");
export const FILES_DIR = join(dataDir, "/files");
export const UPLOAD_DIR = join(dataDir, "/upload");
export const SCREENSHOTS_DIR = join(UPLOAD_DIR, "/screenshots");
export const SECURITY_DIR = join(dataDir, "/security");
export const DB_FILE = join(dataDir, "/db");
export const CONTENT_HASH_FILE_NAME = "contentHash.txt";
export const MIGRATIONS_DIR = join(workDir, "/infra/migrations");

export const PLAYNITE_HOST_ADDRESS = process.env.PLAYNITE_HOST_ADDRESS;
