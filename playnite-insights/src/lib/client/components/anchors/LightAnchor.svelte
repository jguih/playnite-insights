<script lang="ts">
	import BaseAnchor from './BaseAnchor.svelte';
	import type { LightAnchorProps } from './types';

	let { selected, ...props }: LightAnchorProps = $props();
</script>

<BaseAnchor
	{...props}
	class={[
		'active:text-primary-light-active-fg active:bg-primary-light-active-bg',
		'hover:text-primary-light-hover-fg hover:bg-primary-light-hover-bg',
		selected && 'text-primary-light-active-fg',
		!selected && 'text-primary-light-fg',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAnchor>
