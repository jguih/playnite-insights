<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={[
		'border-background-2 border-b-1 flex h-[3.8rem] flex-row items-center justify-between gap-2 p-3',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
