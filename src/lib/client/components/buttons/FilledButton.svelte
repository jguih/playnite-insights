<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let props: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	class={`bg-primary-500 hover:bg-primary-600 active:bg-primary-700 active:ring-primary-500 focus:ring-primary-700 p-1 text-black focus:ring-2 active:ring-2 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
