import { pushState } from '$app/navigation';
import { toast } from '$lib/client/app-state/toast.svelte';
import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized';
import type { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
import type { GameNote, GameNoteFactory } from '@playnite-insights/lib/client';

export type GameNoteEditorDeps = {
	gameNoteFactory: GameNoteFactory;
	gameNoteRepository: GameNoteRepository;
};

export class GameNoteEditor {
	#currentNote: GameNote;
	#noteRepository: GameNoteRepository;

	constructor({ gameNoteFactory: factory, gameNoteRepository }: GameNoteEditorDeps) {
		this.#noteRepository = gameNoteRepository;

		this.#currentNote = $state(
			factory.create({
				Title: null,
				Content: null,
				ImagePath: null,
				GameId: null,
				SessionId: null,
			}),
		);
	}

	saveAsync = async ({
		gameId,
		sessionId,
	}: {
		gameId: GameNote['GameId'];
		sessionId: GameNote['SessionId'];
	}) => {
		const note = { ...this.#currentNote };
		note.GameId = gameId;
		note.SessionId = sessionId;
		try {
			await this.#noteRepository.putAsync({ note });
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: 'Database not ready, please refresh the app' });
			} else if (err instanceof Error) {
				toast.error({ title: 'Failed to save game note', message: err.message });
			}
		}
	};

	openNoteEditor = () => {
		pushState('', { bottomSheet: true });
	};

	closeNoteEditor = () => {
		history.back();
	};

	get currentNote() {
		return this.#currentNote;
	}
}
