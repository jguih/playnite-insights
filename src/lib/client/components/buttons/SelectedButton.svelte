<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let props: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	bind:button={props.button}
	class={`bg-primary-500 hover:border-primary-900 active:border-primary-900 focus:border-primary-900 hover:text-primary-900 border-2 border-solid border-transparent p-1 text-white`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
