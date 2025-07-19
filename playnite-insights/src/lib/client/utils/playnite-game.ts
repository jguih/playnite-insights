import { m } from '$lib/paraglide/messages';
import { fullGameSchema } from '@playnite-insights/lib/client/playnite-game';
import z from 'zod';

export const getPlayniteGameImageUrl = (imagePath?: string | null) => {
	if (!imagePath) return '';
	const [gameId, imageFileName] = imagePath.split('\\');
	return `/api/assets/image/${gameId}/${imageFileName}`;
};

export const getPlaytimeInHours = (playtimeInSecs: number): string => {
	return (playtimeInSecs / 3600).toFixed(1);
};

export const getFormattedPlaytime = (playtime: number): string => {
	if (playtime > 0) {
		const totalMins = Math.floor(playtime / 60);
		const hours = Math.floor(totalMins / 60);
		const mins = totalMins % 60;
		return m.game_playtime_in_hours_and_minutes({ hours: hours, mins: mins });
	}
	return m.game_playtime_in_hours_and_minutes({ hours: 0, mins: 0 });
};

export const fetchGames = async () => {
	const origin = window.location.origin;
	const url = `${origin}/api/game`;
	const response = await fetch(url);
	const asJson = await response.json();
	const games = z.optional(z.array(fullGameSchema)).parse(asJson);
	return games;
};
