<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import SolidButton from '../buttons/SolidButton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-end gap-2">
	<p class="text-center text-lg text-red-500">{m.error_something_went_wrong()}</p>
	<SolidButton
		onclick={() => location.reload()}
		class="w-full">Retry</SolidButton
	>
</div>
