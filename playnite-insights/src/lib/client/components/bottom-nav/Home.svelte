<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Home } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import { bottomNavIconSize } from './common';
	import Text from './Text.svelte';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href = '/';
</script>

{#if selected}
	<BottomNavAnchor
		selected
		{href}
		{...props}
	>
		<Home size={bottomNavIconSize} />
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor
		{href}
		{...props}
	>
		<Home size={bottomNavIconSize} />
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{/if}
