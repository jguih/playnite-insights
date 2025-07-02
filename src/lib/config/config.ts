import { join } from 'path';

const workDir = process.env.WORK_DIR || '/app';
const dataDir = `${workDir}/data`;
const srcDir = `${workDir}/src`;

const path = {
	dataDir: dataDir,
	playniteGamesFile: join(dataDir, '/games.json'),
	libraryManifestFile: join(dataDir, '/manifest.json'),
	tmpDir: join(dataDir, '/tmp'),
	filesDir: join(dataDir, '/files'),
	dbFile: join(dataDir, '/db'),
	initSqlFile: join(srcDir, '/lib/infrastructure/init.sql')
};

export const playniteInsightsConfig = {
	path: path
};
