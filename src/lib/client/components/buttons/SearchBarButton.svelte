<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let { button = $bindable(), ...props }: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	bind:button
	class={`active:text-primary-700 hover:text-primary-500 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
