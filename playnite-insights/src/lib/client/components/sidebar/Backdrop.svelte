<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let { ...props }: HTMLAttributes<HTMLElement> = $props();
</script>

<div
	{...props}
	class={`fixed top-0 right-0 z-1001 h-dvh w-dvw max-w-dvw bg-black opacity-50 ${props.class ?? ''}`}
	role="presentation"
	transition:fade={{ duration: 300 }}
></div>
