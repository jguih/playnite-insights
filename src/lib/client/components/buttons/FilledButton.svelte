<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import BaseButton from './BaseButton.svelte';

	let props: HTMLButtonAttributes = $props();
</script>

<BaseButton
	{...props}
	class={`bg-primary-500 hover:bg-primary-600 active:border-primary-700 focus:border-primary-700 text-black`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
