<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={[
		'bg-background-2 absolute bottom-0 left-0 right-0 flex h-[3.4rem] w-full flex-row items-center justify-end p-2 shadow',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
