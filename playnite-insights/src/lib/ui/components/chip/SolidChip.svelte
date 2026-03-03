<script lang="ts">
	import type { ChipProps } from "./chip.types";

	const { variant = "primary", children, ...props }: ChipProps = $props();
</script>

<span
	{...props}
	class={[
		"inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 ease-out",
		variant === "success" && ["bg-success-active-bg text-success-active-fg"],
		variant === "neutral" && ["bg-neutral-active-bg text-neutral-active-fg"],
		variant === "primary" && ["bg-primary-active-bg text-primary-active-fg"],
		variant === "warning" && ["bg-warning-active-bg text-warning-active-fg"],
		variant === "error" && ["bg-error-active-bg text-error-active-fg"],
		props.class,
	]}
>
	{@render children?.()}
</span>
