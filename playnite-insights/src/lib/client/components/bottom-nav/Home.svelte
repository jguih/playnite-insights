<script
	lang="ts"
	module
>
	let bottomNavHomeHref = $state<string>('/');

	export const updateBottomNavHomeHref = (newHref:string) => {
		bottomNavHomeHref = newHref;
	}
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Home } from '@lucide/svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BottomNavAnchor from '../anchors/BottomNavAnchor.svelte';
	import Text from './Text.svelte';

	let { selected, ...props }: HTMLAnchorAttributes & { selected?: boolean } = $props();
</script>

{#if selected}
	<BottomNavAnchor
		selected
		href={bottomNavHomeHref}
		{...props}
	>
		<Home class={['size-lg']} />
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{:else}
	<BottomNavAnchor
		href={bottomNavHomeHref}
		{...props}
	>
		<Home class={['size-lg']} />
		<Text>{m.bottom_nav_label_home()}</Text>
	</BottomNavAnchor>
{/if}
