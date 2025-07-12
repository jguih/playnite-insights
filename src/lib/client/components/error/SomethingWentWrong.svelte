<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import FilledButton from '../buttons/FilledButton.svelte';
</script>

<div class="flex h-full flex-col justify-end gap-2">
	<p class=" text-center text-lg text-red-500">{m.error_something_went_wrong()}</p>
	<FilledButton onclick={() => location.reload()}>Retry</FilledButton>
</div>
