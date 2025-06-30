import type { PlayniteGameMetadata } from '$lib/models/playnite-game';
import { readFile } from 'fs/promises';
import { logDebug, logError, logSuccess } from './log';
import { playniteInsightsConfig } from '$lib/config/config';

const PLAYNITE_GAMES_FILE = playniteInsightsConfig.path.playniteGamesFile;
let gamesList: Array<PlayniteGameMetadata> | null = null;

export const loadGamesList = async (): Promise<void> => {
	logDebug('Loading Playnite games list into memory...');
	try {
		const content = await readFile(PLAYNITE_GAMES_FILE, 'utf-8');
		gamesList = (JSON.parse(content.toString()) as Array<PlayniteGameMetadata>) ?? [];
		logSuccess(`Loaded ${gamesList.length} games from Playnite games file`);
	} catch (error) {
		logError('Error reading game list file', error as Error);
		gamesList = [];
	}
};

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
