import type { GameNote } from '@playnite-insights/lib/client';
import type { GameNoteRepository } from './gameNotesRepository.svelte';

type GetAsyncArgs = { filterBy: typeof GameNoteRepository.FILTER_BY.Id } & Pick<GameNote, 'Id'>;
type GetAllAsyncArgs =
	| { filterBy: typeof GameNoteRepository.FILTER_BY.byGameId; GameId: string }
	| { filterBy?: undefined };

export interface IGameNotesRepository {
	/**
	 * Add a game note
	 * @returns The note key if created successfully
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	addAsync: (props: { note: GameNote }) => Promise<string | null>;
	/**
	 * Updates a game note, will create it if missing
	 * @returns `true` on success, `false` otherwise
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	putAsync: (props: { note: GameNote }) => Promise<boolean>;
	/**
	 * Finds and returns a game note using the given filters
	 * @returns The game note or `null` when not found
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	getAsync: (props: GetAsyncArgs) => Promise<GameNote | null>;
	/**
	 * Finds and returns all game notes using the given filters
	 * @param props
	 * @returns An array of game notes
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	getAllAsync: (props?: GetAllAsyncArgs) => Promise<GameNote[]>;
}
