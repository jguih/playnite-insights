<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let { ...props }: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	class={`active:text-primary-700 hover:text-primary-500 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
