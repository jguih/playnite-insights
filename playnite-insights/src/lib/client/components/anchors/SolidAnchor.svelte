<script lang="ts">
	import BaseAnchor from './BaseAnchor.svelte';
	import type { LightAnchorProps } from './types';

	let { selected, ...props }: LightAnchorProps = $props();
</script>

<BaseAnchor
	{...props}
	class={[
		'bg-primary-bg',
		selected ? 'text-primary-bg' : 'text-primary-fg',
		'active:text-primary-active-fg active:bg-primary-active-bg',
		'hover:text-primary-hover-fg hover:bg-primary-hover-bg',
		'focus:ring-primary-active-fg focus:ring-2',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAnchor>
