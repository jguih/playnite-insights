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

	export const currentNoteValues = $state<Pick<Note, 'Title' | 'Content'>>({
		Title: '',
		Content: '',
	});
</script>
