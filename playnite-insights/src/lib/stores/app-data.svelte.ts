import type { Developer } from '@playnite-insights/lib/client/developer';
import type { FullGame } from '@playnite-insights/lib/client/playnite-game';

export const gameStore: { raw?: FullGame[] } = $state({});
export const devStore: { raw?: Developer[] } = $state({});
