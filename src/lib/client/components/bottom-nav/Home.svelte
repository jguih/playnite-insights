<script lang="ts">
	import { Home } from '@lucide/svelte';
	import SelectedAnchor from '../anchors/SelectedAnchor.svelte';
	import BaseAnchor from '../anchors/BaseAnchor.svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
</script>

{#if selected}
	<SelectedAnchor href="/" {...props}>
		<Home />
	</SelectedAnchor>
{:else}
	<BaseAnchor href="/" {...props}>
		<Home />
	</BaseAnchor>
{/if}
