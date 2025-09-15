<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { LightButtonProps } from './types';

	let { color = 'primary', selected, ...props }: LightButtonProps = $props();
</script>

<BaseButton
	{...props}
	class={[
		color === 'primary' && [
			selected ? 'text-primary-bg' : 'text-primary-light-fg',
			'bg-primary-light-bg',
			'hover:text-primary-light-hover-fg hover:bg-primary-light-hover-bg',
			'active:text-primary-light-active-fg active:bg-primary-light-active-bg',
			'focus:ring-primary-light-active-fg focus:ring-2',
			'disabled:bg-primary-light-disabled-bg disabled:text-primary-light-disabled-fg',
		],
		color === 'neutral' && [
			selected ? 'text-neutral-light-active-fg' : 'text-neutral-light-fg',
			'bg-neutral-light-bg',
			'hover:text-neutral-light-hover-fg hover:bg-neutral-light-hover-bg',
			'active:text-neutral-light-active-fg active:bg-neutral-light-active-bg',
			'focus:ring-neutral-light-active-fg focus:ring-2',
			'disabled:bg-neutral-light-disabled-bg disabled:text-neutral-light-disabled-fg',
		],
		'disabled:cursor-not-allowed',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
