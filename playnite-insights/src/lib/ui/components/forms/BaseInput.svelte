<script lang="ts">
	import type { BaseInputProps } from "./types";

	let {
		value = $bindable<BaseInputProps["value"]>(),
		input = $bindable(),
		size = "md",
		...props
	}: BaseInputProps = $props();
</script>

<input
	{...props}
	bind:value
	bind:this={input}
	class={[
		size === "sm" && ["h-8", "px-2", "text-sm", "leading-none"],
		size === "md" && ["h-11", "px-3", "text-base", "leading-none"],
		size === "lg" && ["h-12", "px-4", "text-lg", "leading-none"],
		"box-border",
		"m-0 outline-0 transition-colors duration-150 ease-out",
		[
			"disabled:cursor-not-allowed",
			"disabled:focus-visible:ring-0",
			"disabled:focus-visible:border-current",
		],
		props.class,
	]}
/>
