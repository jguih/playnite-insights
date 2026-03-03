<script lang="ts">
	import { cubicInOut } from "svelte/easing";
	import type { HTMLAttributes } from "svelte/elements";
	import { fade } from "svelte/transition";

	type SkeletonProps = {
		hideName?: boolean;
	};

	const { hideName = false, ...props }: SkeletonProps & HTMLAttributes<HTMLLIElement> = $props();
</script>

<li
	{...props}
	class={[
		"list-none w-full aspect-[1/1.6]",
		"bg-background-1 shadow-md",
		"border-3 border-black/10",
		"animate-pulse",
		props.class,
	]}
	transition:fade={{ duration: 120, easing: cubicInOut }}
>
	<div class={["w-full bg-black/10", !hideName ? "h-7/8" : "h-full"]}></div>
	{#if !hideName}
		<div class="h-1/8 flex items-center justify-center p-2"></div>
	{/if}
</li>
