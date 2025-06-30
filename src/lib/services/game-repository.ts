import type { PlayniteGameMetadata } from '$lib/models/playnite-game';
import { readFile } from 'fs/promises';
import { logDebug, logError } from './log';
import { playniteInsightsConfig } from '$lib/config/config';

const PLAYNITE_GAMES_FILE = playniteInsightsConfig.path.playniteGamesFile;

const getGameListFromFile = async (): Promise<PlayniteGameMetadata[]> => {
	try {
		logDebug(`Reading game list JSON file at ${PLAYNITE_GAMES_FILE}`);
		const content = await readFile(PLAYNITE_GAMES_FILE, 'utf-8');
		const asJson = JSON.parse(content.toString()) as Array<PlayniteGameMetadata>;
		logDebug(`Read game list JSON file succesfully, returning ${asJson.length} games`);
		return asJson ?? [];
	} catch (error) {
		logError('Error reading game list file', error as Error);
		return [];
	}
};

export const getGameList = async (): Promise<Array<PlayniteGameMetadata>> => {
	return await getGameListFromFile();
};

export const getGameById = async (playniteGameId: string): Promise<PlayniteGameMetadata | null> => {
	const gameList = await getGameListFromFile();
	if (gameList.length === 0) {
		return null;
	}
	const game = gameList.find((game) => game.Id === playniteGameId);
	return game ?? null;
};
