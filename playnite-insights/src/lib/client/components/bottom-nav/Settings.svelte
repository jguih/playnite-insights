<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Settings } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import Text from './Text.svelte';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
	const href = '/settings';
</script>

{#if selected}
	<BottomNavAnchor
		selected
		{href}
		{...props}
	>
		<Settings class={['size-lg']} />
		<Text>{m.bottom_nav_label_settings()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor
		{href}
		{...props}
	>
		<Settings class={['size-lg']} />
		<Text>{m.bottom_nav_label_settings()}</Text>
	</BottomNavAnchor>
{/if}
