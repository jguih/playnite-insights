import type { PlayniteGameMetadata } from '$lib/models/playnite-game';

export const gameListStore: { games: PlayniteGameMetadata[] } = $state({ games: [] });
