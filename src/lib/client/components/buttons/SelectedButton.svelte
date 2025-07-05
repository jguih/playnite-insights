<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import BaseButton from './BaseButton.svelte';

	let props: HTMLButtonAttributes = $props();
</script>

<BaseButton
	{...props}
	class={`bg-primary-500 hover:border-primary-900 active:border-primary-900 focus:border-primary-900 hover:text-primary-900 text-white`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseButton>
