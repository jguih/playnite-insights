<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let props: HTMLAnchorAttributes = $props();
</script>

<a
	{...props}
	class={`hover:border-primary-500 hover:text-primary-500 focus:border-primary-500 active:border-primary-500 cursor-pointer border-2 border-solid border-transparent p-1 outline-0 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
