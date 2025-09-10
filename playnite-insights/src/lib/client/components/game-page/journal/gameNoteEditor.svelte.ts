import { pushState } from '$app/navigation';
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

		this.#currentNote = factory.create({
			Title: null,
			Content: null,
			ImagePath: null,
			GameId: null,
			SessionId: null,
		});
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
			console.error('failed to save note', err);
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
