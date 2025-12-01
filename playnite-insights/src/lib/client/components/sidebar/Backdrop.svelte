<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let { ...props }: HTMLAttributes<HTMLElement> = $props();
</script>

<div
	{...props}
	class={['fixed right-0 top-0 z-20 h-full w-full max-w-full bg-black opacity-50', props.class]}
	role="presentation"
	transition:fade={{ duration: 150 }}
></div>
