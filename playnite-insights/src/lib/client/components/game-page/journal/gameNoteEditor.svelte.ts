import { pushState } from '$app/navigation';
import { page } from '$app/state';
import { toast } from '$lib/client/app-state/toast.svelte';
import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized';
import type { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
import { m } from '$lib/paraglide/messages';
import type { GameNote, GameNoteFactory } from '@playnite-insights/lib/client';

export type GameNoteEditorDeps = {
	gameNoteFactory: GameNoteFactory;
	gameNoteRepository: GameNoteRepository;
};

export class GameNoteEditor {
	#currentNote: GameNote;
	#noteRepository: GameNoteEditorDeps['gameNoteRepository'];
	#gameNoteFactory: GameNoteEditorDeps['gameNoteFactory'];
	#isOpen: boolean;
	#isDirty: boolean;

	constructor({ gameNoteFactory: factory, gameNoteRepository }: GameNoteEditorDeps) {
		this.#noteRepository = gameNoteRepository;
		this.#gameNoteFactory = factory;

		this.#isOpen = $derived(Object.hasOwn(page.state, 'noteEditor'));
		this.#isDirty = false;
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

	saveAsync = async () => {
		if (!this.#isDirty) return;
		const note = { ...this.#currentNote };
		try {
			await this.#noteRepository.putAsync({ note });
			this.#isDirty = false;
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: m.error_db_not_ready(), category: 'local-database' });
			} else if (err instanceof Error) {
				toast.error({
					title: m.error_save_game_note(),
					message: err.message,
					category: 'local-database',
				});
			}
		}
	};

	deleteAsync = async () => {
		const note = { ...this.#currentNote };
		try {
			await this.#noteRepository.deleteAsync({ noteId: note.Id });
			this.#currentNote = this.#gameNoteFactory.create({
				Title: null,
				Content: null,
				ImagePath: null,
				GameId: null,
				SessionId: null,
			});
			this.close();
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: m.error_db_not_ready(), category: 'local-database' });
			} else if (err instanceof Error) {
				toast.error({
					title: m.error_save_game_note(),
					message: err.message,
					category: 'local-database',
				});
			}
		}
	};

	open = () => {
		pushState('', { ...page.state, noteEditor: true });
	};

	close = () => {
		history.back();
	};

	get isOpen() {
		return this.#isOpen;
	}

	get currentNote() {
		return this.#currentNote;
	}

	set currentNote(note: GameNote) {
		this.#currentNote = note;
	}

	set isDirty(val: boolean) {
		this.#isDirty = val;
	}
}
