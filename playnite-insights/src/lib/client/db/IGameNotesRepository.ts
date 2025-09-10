import type { GameNote } from '@playnite-insights/lib/client';
import type { GameNoteRepository } from './gameNotesRepository.svelte';

type GetAsyncArgs = { filterBy: typeof GameNoteRepository.FILTER_BY.Id } & Pick<GameNote, 'Id'>;

export interface IGameNotesRepository {
	addAsync: (props: { note: GameNote }) => Promise<string | null>;
	putAsync: (props: { note: GameNote }) => Promise<boolean>;
	getAsync: (props: GetAsyncArgs) => Promise<GameNote | null>;
}
