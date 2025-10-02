<script lang="ts">
	import BaseAnchor from './BaseAnchor.svelte';
	import type { LightAnchorProps } from './types';

	let { selected, ...props }: LightAnchorProps = $props();
</script>

<BaseAnchor
	{...props}
	class={[
		'bg-primary-light-bg',
		selected ? 'text-primary-bg' : 'text-primary-light-fg',
		'active:text-primary-light-active-fg active:bg-primary-light-active-bg',
		'hover:text-primary-light-hover-fg hover:bg-primary-light-hover-bg',
		'focus:ring-primary-light-active-fg focus:ring-2',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAnchor>
