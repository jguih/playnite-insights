<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let { ...props }: HTMLAttributes<HTMLElement> = $props();
</script>

<div
	{...props}
	class={`z-1001 fixed right-0 top-0 h-full w-full max-w-full bg-black opacity-50 ${props.class ?? ''}`}
	role="presentation"
	transition:fade={{ duration: 300 }}
></div>
