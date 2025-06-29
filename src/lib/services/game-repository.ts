import type { PlayniteGameMetadata } from '$lib/models/playnite-game';
import { readFile } from 'fs/promises';
import { logDebug, logError } from './log';
import { playniteInsightsConfig } from '$lib/config/config';
import { watchFile } from 'fs';

const PLAYNITE_GAMES_FILE_DIR = playniteInsightsConfig.path.playniteGamesFile;
const WATCH_FILE_INTERVAL = 1000; // Interval in milliseconds to check for changes
let gamesList: Array<PlayniteGameMetadata> | null = null;

export const loadGamesList = async (): Promise<void> => {
	logDebug('Reloading Playnite games list into memory...');
	try {
		const content = await readFile(PLAYNITE_GAMES_FILE_DIR, 'utf-8');
		gamesList = (JSON.parse(content.toString()) as Array<PlayniteGameMetadata>) ?? [];
		logDebug(`Loaded ${gamesList.length} games from Playnite games file.`);
	} catch (error) {
		logError('Error reading game list file', error as Error);
		gamesList = [];
	}
};

watchFile(PLAYNITE_GAMES_FILE_DIR, { interval: WATCH_FILE_INTERVAL }, async (curr, prev) => {
	if (curr.mtime !== prev.mtime) {
		logDebug('Detected change in Playnite games file');
		await loadGamesList();
	}
});

export const getGameList = async (): Promise<Array<PlayniteGameMetadata>> => {
	return gamesList ?? [];
};

export const getGameById = async (playniteGameId: string): Promise<PlayniteGameMetadata | null> => {
	if (!gamesList) {
		return null;
	}
	const game = gamesList.find((game) => game.Id === playniteGameId);
	return game ?? null;
};
