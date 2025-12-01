<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={[
		'border-background-2 border-b-1 z-21 absolute left-0 right-0 top-0 flex h-[var(--header-height)] flex-row items-center justify-between gap-2 p-4 shadow',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
