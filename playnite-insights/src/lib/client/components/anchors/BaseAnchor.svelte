<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let props: HTMLAnchorAttributes = $props();
</script>

<a
	{...props}
	class={`hover:text-primary-500 active:text-primary-700 cursor-pointer p-1 ${props.class ?? ''}`}
	transition:fade={{ duration: 150 }}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
