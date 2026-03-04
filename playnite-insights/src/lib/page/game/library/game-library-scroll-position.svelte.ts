export const gameLibraryPageScrollState = $state({
	y: 0,
});

export const resetGameLibraryScrollPosition = () => {
	gameLibraryPageScrollState.y = 0;
};
