<script lang="ts">
	import { cubicOut } from "svelte/easing";
	import type { HTMLAttributes } from "svelte/elements";
	import { fade } from "svelte/transition";

	let { ...props }: HTMLAttributes<HTMLElement> = $props();
</script>

<div
	{...props}
	role="presentation"
	class={[
		"absolute right-0 top-0",
		"h-full w-full max-w-full",
		"bg-black opacity-50 pointer-events-auto",
		props.class,
	]}
	transition:fade={{ duration: 150, easing: cubicOut }}
></div>
