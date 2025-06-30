// import { watchFile } from 'fs';
// import { logDebug } from './log';
import { loadLibraryManifest } from './library-manifest';
// import { playniteInsightsConfig } from '$lib/config/config';
import { loadGamesList } from './game-repository';

// const MANIFEST_FILE = playniteInsightsConfig.path.libraryManifestFile;
// const PLAYNITE_GAMES_FILE = playniteInsightsConfig.path.playniteGamesFile;
// const WATCH_FILE_INTERVAL = 1000; // Interval in milliseconds to check for changes

export const setupWatchers = async () => {
	await loadGamesList();
	await loadLibraryManifest();

	// watchFile(MANIFEST_FILE, { interval: WATCH_FILE_INTERVAL }, async (curr, prev) => {
	// 	if (curr.mtime !== prev.mtime) {
	// 		logDebug('Detected change in manifest.json file');
	// 		await loadLibraryManifest();
	// 	}
	// });

	// watchFile(PLAYNITE_GAMES_FILE, { interval: WATCH_FILE_INTERVAL }, async (curr, prev) => {
	// 	if (curr.mtime !== prev.mtime) {
	// 		logDebug('Detected change in Playnite games file');
	// 		await loadGamesList();
	// 	}
	// });
};
