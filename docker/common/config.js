import { access } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
export const WORK_DIR = process.env.WORK_DIR;
if (!WORK_DIR) {
  throw new Error(`WORK_DIR not defined!`);
}
await access(WORK_DIR);
export const DATA_DIR = join(WORK_DIR, '/data');
await access(DATA_DIR);
export const DB_FILE = join(DATA_DIR, 'db');
export const INIT_DB_SQL_FILE = join(__dirname, 'init.sql');
export const FILES_DIR = join(DATA_DIR, '/files');
export const MANIFEST_FILE = join(DATA_DIR, '/manifest.json');

// --- Logging

export const LOG_LEVELS = {
  none: 1000,
  debug: 0,
  info: 1,
  success: 2,
  error: 3
};

const getLogLevel = () => {
  if (process.env.LOG_LEVEL) {
    return Number(process.env.LOG_LEVEL);
  }
  if (process.env.NODE_ENV == 'testing') {
    return LOG_LEVELS.none;
  }
  if (process.env.NODE_ENV == 'production') {
    return LOG_LEVELS.info;
  }
  return LOG_LEVELS.debug;
};

export const CURRENT_LOG_LEVEL = getLogLevel();

const getDateTimeString = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
};

export const logError = (message, error) => {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.error) {
    return;
  }
  console.error(`[${getDateTimeString()}][ERROR] ${message}`);
  if (error) {
    console.error(error);
  }
};

export const logDebug = (message) => {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.debug) {
    return;
  }
  console.debug(`[${getDateTimeString()}][DEBUG] ${message}`);
};

export const logSuccess = (message) => {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.success) {
    return;
  }
  console.log(`[${getDateTimeString()}][SUCCESS] ${message}`);
};

export const logInfo = (message) => {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.info) {
    return;
  }
  console.info(`[${getDateTimeString()}][INFO] ${message}`);
};