<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLElement> = $props();
</script>

<header
	{...props}
	class={[
		'bg-background-1 fixed top-0 right-0 left-0 z-10 h-[var(--header-height)] w-full px-4 py-2 shadow',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</header>
