<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import BaseButton from './BaseButton.svelte';

	let props: HTMLButtonAttributes = $props();
</script>

<BaseButton
	{...props}
	class={`hover:border-primary-500 active:border-primary-700 active:text-primary-700 focus:border-primary-500 hover:text-primary-500`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
