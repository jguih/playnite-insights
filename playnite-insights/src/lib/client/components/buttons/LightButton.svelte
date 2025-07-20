<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let { color = 'neutral', ...props }: BaseButtonProps = $props();
	const textColor = `${color === 'primary' ? 'text-primary-400' : 'text-white'}`;
</script>

<BaseButton
	{...props}
	class={`active:text-primary-700 focus:ring-primary-500 hover:text-primary-500  ${textColor} border-transparent p-1 focus:ring-2 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
