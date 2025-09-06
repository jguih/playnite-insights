<script
	lang="ts"
	module
>
	import { pushState } from '$app/navigation';
	import type { Note } from '@playnite-insights/lib/client/notes';

	export const openNoteEditor = () => {
		pushState('', { bottomSheet: true });
	};

	export const closeNoteEditor = () => {
		history.back();
	};

	export const currentNoteSignal = $state<Note>({
		Id: '',
		Title: '',
		Content: null,
		ImagePath: null,
		CreatedAt: '',
		LastUpdatedAt: '',
	});
</script>
