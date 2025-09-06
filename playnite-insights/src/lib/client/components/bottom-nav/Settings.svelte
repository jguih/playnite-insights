<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { bottomNavIconSize } from './common';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import Text from './Text.svelte';
	import { m } from '$lib/paraglide/messages';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href = '/settings';
</script>

{#if selected}
	<BottomNavAnchor
		selected
		{href}
		{...props}
	>
		<Settings size={bottomNavIconSize} />
		<Text>{m.bottom_nav_label_settings()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor
		{href}
		{...props}
	>
		<Settings size={bottomNavIconSize} />
		<Text>{m.bottom_nav_label_settings()}</Text>
	</BottomNavAnchor>
{/if}
