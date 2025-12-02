<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={[
		'border-background-2 absolute top-0 right-0 left-0 z-21 flex h-[var(--header-height)] flex-row items-center justify-between gap-2 border-b-1 p-4 shadow',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
