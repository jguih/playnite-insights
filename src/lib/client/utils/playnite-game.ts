export const getPlayniteGameImageUrl = (imagePath?: string | null) => {
	if (!imagePath) return '';
	const [gameId, imageFileName] = imagePath.split('\\');
	return `/api/assets/image/${gameId}/${imageFileName}`;
};

export const getPlaytimeInHours = (playtimeInSecs: number): string => {
	return (playtimeInSecs / 3600).toFixed(1);
};
