<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let props: HTMLButtonAttributes = $props();
</script>

<button
	{...props}
	class={`hover:text-primary-500 hover:border-primary-500 active:border-primary-500 focus:border-primary-500 disabled:hover:border-primary-950 disabled:hover:text-primary-950 flex flex-row items-center justify-center gap-1 border-2 border-solid border-transparent p-1 outline-0 disabled:text-neutral-500 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
