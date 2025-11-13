<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	transition:fade={{ duration: 100 }}
	class={['p-2', props.class]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
