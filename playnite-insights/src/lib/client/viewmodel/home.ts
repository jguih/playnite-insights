import {
	gamePageSizes,
	type FullGame,
	type GamePageSizes,
	type GameSortBy,
	type GameSortOrder
} from '@playnite-insights/lib/client/playnite-game';
import type { PageProps } from '../../../routes/$types';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';
import { m } from '$lib/paraglide/messages';

export const makeHomePageViewModel = (games: FullGame[] | undefined, data: PageProps['data']) => {
	let resolvedGames: FullGame[] | undefined;
	let isError: boolean = false;

	const applyFilters = () => {
		if (!resolvedGames) return;
		let filtered = [...resolvedGames];
		const query = data.query;
		const installed = data.installed && !data.notInstalled;
		const notInstalled = !data.installed && data.notInstalled;
		if (query !== null) {
			filtered = resolvedGames.filter((g) => g.Name?.toLowerCase().includes(query.toLowerCase()));
		}
		if (installed) {
			filtered = filtered.filter((g) => +g.IsInstalled);
		}
		if (notInstalled) {
			filtered = filtered.filter((g) => !+g.IsInstalled);
		}
		resolvedGames = filtered;
	};

	const applySorting = () => {
		if (!resolvedGames) return;
		let sorted = [...resolvedGames];
		const sortBy = data.sortBy;
		const sortOrder = data.sortOrder;
		const multiplier = sortOrder === 'asc' ? 1 : -1;

		resolvedGames = sorted.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === 'Added' || sortBy === 'LastActivity') {
				aValue = aValue ? new Date(aValue).getTime() : null;
				bValue = bValue ? new Date(bValue).getTime() : null;
			}

			const aIsNull = aValue === null || aValue === undefined;
			const bIsNull = bValue === null || bValue === undefined;

			if (aIsNull && bIsNull) return a.Id.localeCompare(b.Id);
			if (aIsNull) return -1 * multiplier;
			if (bIsNull) return 1 * multiplier;

			if (aValue! < bValue!) return -1 * multiplier;
			if (aValue! > bValue!) return 1 * multiplier;

			return 0;
		});
	};

	const getPaginatedList = () => {
		if (!resolvedGames) return;
		const paginated = [...resolvedGames];
		const pageSize = Number(data.pageSize);
		const offset = (Number(data.page) - 1) * Number(data.pageSize);
		const end = Math.min(offset + pageSize, resolvedGames.length);
		return paginated.slice(offset, end);
	};

	resolvedGames = games ? [...games] : undefined;
	applyFilters();
	applySorting();

	const getOffset = (): number => (Number(data.page) - 1) * Number(data.pageSize);
	const getTotalGamesCount = (): number => (resolvedGames ? resolvedGames.length : 0);
	const getGameCountFrom = (): number => getOffset();
	const getGameCountTo = (): number =>
		Math.min(Number(data.pageSize) + getOffset(), getTotalGamesCount());
	const getTotalPages = (): number =>
		resolvedGames ? Math.ceil(resolvedGames.length / Number(data.pageSize)) : 0;
	const getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);
	const getPageSizeList = (): GamePageSizes => gamePageSizes;
	const getIsError = (): boolean => isError;
	const getGameList = () => getPaginatedList();

	const getSortOrderLabel = (sortOrder: GameSortOrder): string => {
		switch (sortOrder) {
			case 'asc':
				return m.option_sort_ascending();
			case 'desc':
				return m.option_sort_descending();
		}
	};

	const getSortByLabel = (sortBy: GameSortBy): string => {
		switch (sortBy) {
			case 'IsInstalled':
				return m.option_sortby_is_installed();
			case 'Added':
				return m.option_sortby_added();
			case 'LastActivity':
				return m.option_sortby_last_activity();
			case 'Playtime':
				return m.option_sortby_playtime();
			default:
				return sortBy;
		}
	};

	return {
		getOffset,
		getTotalGamesCount,
		getGameCountFrom,
		getGameCountTo,
		getTotalPages,
		getImageURL,
		getPageSizeList,
		getIsError,
		getSortOrderLabel,
		getSortByLabel,
		getGameList
	};
};
