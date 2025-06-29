import { join } from 'path';

const dataDir = process.env.DATA_DIR || '/app/data';

const path = {
	dataDir: dataDir,
	playniteGamesFile: join(dataDir, '/games.json'),
	libraryManifestFile: join(dataDir, '/manifest.json'),
	tmpDir: join(dataDir, '/tmp'),
	filesDir: join(dataDir, '/files')
};

export const playniteInsightsConfig = {
	path: path
};
