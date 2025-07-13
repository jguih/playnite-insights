<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let props: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	bind:button={props.button}
	class={`bg-primary-500 hover:bg-primary-600 active:bg-primary-700 active:border-primary-500 focus:border-primary-700 border-2 border-solid border-transparent p-1 text-black ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
