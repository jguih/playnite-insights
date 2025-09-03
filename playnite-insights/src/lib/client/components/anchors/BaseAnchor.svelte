<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let props: HTMLAnchorAttributes = $props();
</script>

<a
	{...props}
	class={`hover:text-primary-500 active:text-primary-700 cursor-pointer p-1 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
