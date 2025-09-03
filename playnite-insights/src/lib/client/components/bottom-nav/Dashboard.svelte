<script lang="ts">
	import { LayoutDashboard } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import { bottomNavIconSize } from './common';
	import Text from './Text.svelte';
	import { m } from '$lib/paraglide/messages';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href="/dash"
</script>

{#if selected}
	<BottomNavAnchor selected href={href} {...props}>
		<LayoutDashboard size={bottomNavIconSize}/>
		<Text>{m.bottom_nav_label_dash()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor href={href} {...props}>
		<LayoutDashboard size={bottomNavIconSize}/>
		<Text>{m.bottom_nav_label_dash()}</Text>
	</BottomNavAnchor>
{/if}
