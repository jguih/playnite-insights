<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={['absolute bottom-0 left-0 top-[3.8rem] w-full overflow-y-auto p-3', props.class]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
