<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import SelectedAnchor from '../anchors/SelectedAnchor.svelte';
	import BaseAnchor from '../anchors/BaseAnchor.svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
</script>

{#if selected}
	<SelectedAnchor href="/settings" {...props}>
		<Settings />
	</SelectedAnchor>
{:else}
	<BaseAnchor href="/settings" {...props}>
		<Settings />
	</BaseAnchor>
{/if}
