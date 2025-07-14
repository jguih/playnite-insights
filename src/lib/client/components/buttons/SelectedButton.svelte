<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { BaseButtonProps } from './types';

	let props: BaseButtonProps = $props();
</script>

<BaseButton
	{...props}
	class={`bg-primary-500 focus:ring-primary-700 hover:bg-primary-600 p-1 text-white ring-transparent focus:ring-2`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
