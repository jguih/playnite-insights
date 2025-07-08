<script lang="ts">
	import { LayoutDashboard } from '@lucide/svelte';
	import BaseAnchor from '../anchors/BaseAnchor.svelte';
	import SelectedAnchor from '../anchors/SelectedAnchor.svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
</script>

{#if selected}
	<SelectedAnchor href="/dash" {...props}>
		<LayoutDashboard />
	</SelectedAnchor>
{:else}
	<BaseAnchor href="/dash" {...props}>
		<LayoutDashboard />
	</BaseAnchor>
{/if}
