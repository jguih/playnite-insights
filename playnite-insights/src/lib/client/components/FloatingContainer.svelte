<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...props} class={`z-1000 fixed bottom-[var(--bottom-nav-height)] ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
