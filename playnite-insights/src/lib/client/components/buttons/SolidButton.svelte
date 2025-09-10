<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { LightButtonProps } from './types';

	let { color = 'primary', selected, ...props }: LightButtonProps = $props();
</script>

<BaseButton
	{...props}
	class={[
		color === 'primary' && [
			selected ? 'text-primary-active-fg' : 'text-primary-fg',
			'bg-primary-bg',
			'hover:text-primary-hover-fg hover:bg-primary-hover-bg',
			'active:text-primary-active-fg active:bg-primary-active-bg',
			'focus:ring-primary-active-bg focus:ring-2',
			'disabled:bg-primary-disabled-bg disabled:text-primary-disabled-fg',
		],
		color === 'neutral' && [
			selected ? 'text-neutral-active-fg' : 'bg-neutral-active-bg',
			'bg-neutral-bg',
			'hover:text-neutral-hover-fg hover:bg-neutral-hover-bg',
			'active:text-neutral-active-fg active:bg-neutral-active-bg',
			'focus:ring-neutral-active-bg focus:ring-2',
			'disabled:bg-neutral-disabled-bg disabled:text-neutral-disabled-fg',
		],
		'p-1 disabled:cursor-not-allowed',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
