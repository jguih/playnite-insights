<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { LayoutDashboard } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import Text from './Text.svelte';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href = '/dash';
</script>

{#if selected}
	<BottomNavAnchor
		selected
		{href}
		{...props}
	>
		<LayoutDashboard class={['size-lg']} />
		<Text>{m.bottom_nav_label_dash()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor
		{href}
		{...props}
	>
		<LayoutDashboard class={['size-lg']} />
		<Text>{m.bottom_nav_label_dash()}</Text>
	</BottomNavAnchor>
{/if}
