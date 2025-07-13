<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let props: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	bind:button={props.button}
	class={`hover:border-primary-500 active:border-primary-700 active:text-primary-700 focus:border-primary-500 hover:text-primary-500 border-2 border-solid border-transparent p-1 text-white ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
