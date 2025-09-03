<script lang="ts">
	import { Home } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { bottomNavIconSize } from './common';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import Text from './Text.svelte';
	import { m } from '$lib/paraglide/messages';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href="/"
</script>

{#if selected}
	<BottomNavAnchor selected href={href} {...props}>
		<Home size={bottomNavIconSize}/>
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor href={href} {...props}>
		<Home size={bottomNavIconSize}/>
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{/if}
