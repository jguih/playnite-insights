import { join } from 'path';

const workDir = process.env.WORK_DIR || '/app';
const dataDir = `${workDir}/data`;
const srcDir = `${workDir}/src`;

export const DATA_DIR = dataDir;
export const PLAYNITE_GAMES_JSON_FILE = join(dataDir, '/games.json');
export const LIBRARY_MANIFEST_FILE = join(dataDir, '/manifest.json');
export const TMP_DIR = join(dataDir, '/tmp');
export const FILES_DIR = join(dataDir, '/files');
export const DB_FILE = join(dataDir, '/db');
export const INIT_SQL_FILE = join(srcDir, '/lib/infrastructure/init.sql');
export const CONTENT_HASH_FILE_NAME = 'contentHash.txt';
export const INIT_DB_SQL_FILE = join(workDir, '/docker/init.sql');
export const MIGRATIONS_DIR = join(workDir, '/docker/migrations');
