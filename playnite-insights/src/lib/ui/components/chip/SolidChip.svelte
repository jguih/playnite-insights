<script lang="ts">
	import type { ChipProps } from "./chip.types";

	const { variant = "primary", children, ...props }: ChipProps = $props();
</script>

<span
	{...props}
	class={[
		"inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 ease-out",
		variant === "success" && ["bg-success-bg text-success-fg"],
		variant === "neutral" && ["bg-neutral-bg text-neutral-fg"],
		variant === "primary" && ["bg-primary-bg text-primary-fg"],
		variant === "warning" && ["bg-warning-bg text-warning-fg"],
		variant === "error" && ["bg-error-bg text-error-fg"],
		props.class,
	]}
>
	{@render children?.()}
</span>
