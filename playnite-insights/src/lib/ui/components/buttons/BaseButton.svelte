<script lang="ts">
	import Spinner from "../Spinner.svelte";
	import type { BaseButtonProps } from "./types";

	let {
		button = $bindable<HTMLButtonElement>(),
		justify = "center",
		rounded = false,
		size = "md",
		iconOnly,
		state = "default",
		type = "button",
		...props
	}: BaseButtonProps = $props();

	const loading = $derived(state === "loading");
</script>

<button
	{type}
	data-state={state}
	aria-busy={loading}
	{...props}
	class={[
		iconOnly && [
			size === "sm" && "h-9 w-9 text-sm",
			size === "md" && "h-10 w-10 text-base",
			size === "lg" && "h-12 w-12 text-lg",
			size === "xl" && "h-20 w-20 text-xl",
		],
		!iconOnly && [
			size === "sm" && "h-8 gap-1.5 px-3 text-sm",
			size === "md" && "h-10 gap-2 px-5 text-base",
			size === "lg" && "h-12 gap-2.5 px-5 text-lg",
		],
		"relative inline-flex cursor-pointer select-none items-center whitespace-nowrap",
		"transition-colors duration-150 ease-out",
		"outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
		rounded && "rounded-full",
		"hover:shadow-sm active:shadow-none",
		"data-[state=disabled]:cursor-not-allowed",
		"data-[state=loading]:cursor-wait",
		props.class,
	]}
	bind:this={button}
>
	{#if loading}
		<span class="absolute inset-0 flex items-center justify-center">
			<Spinner {size} />
		</span>
	{/if}

	<span
		class={[
			"inline-flex items-center gap-2 w-full",
			loading && "invisible",
			justify === "center" && "justify-center",
			justify === "between" && "justify-between",
			justify === "start" && "justify-start",
		]}
	>
		{#if props.children}
			{@render props.children()}
		{/if}
	</span>
</button>
