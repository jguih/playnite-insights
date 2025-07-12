<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let props: HTMLButtonAttributes = $props();
</script>

<button
	{...props}
	class={`disabled:hover:border-primary-950 disabled:hover:text-primary-950 flex cursor-pointer flex-row items-center justify-center gap-1 border-2 border-solid border-transparent p-1 outline-0 disabled:text-neutral-500 ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
