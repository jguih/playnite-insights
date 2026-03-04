<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = HTMLAttributes<HTMLDivElement> & { bottomNav?: Snippet } & (
			| {
					header?: null;
					banner?: null;
			  }
			| {
					header: Snippet;
					banner: Snippet;
			  }
		);

	let props: Props = $props();
</script>

<div
	{...props}
	class={[
		"grid h-dvh max-w-100 mx-auto overflow-hidden",
		props.header &&
			props.bottomNav &&
			"grid-rows-[var(--header-height)_1fr_var(--bottom-nav-height)]",
		props.header && !props.bottomNav && "grid-rows-[var(--header-height)_1fr]",
		!props.header && props.bottomNav && "grid-rows-[1fr_var(--bottom-nav-height)]",
		!props.header && !props.bottomNav && "grid-rows-[1fr]",
		props.class,
	]}
>
	{#if props.header}
		<div>
			{@render props.header()}
			{@render props.banner()}
		</div>
	{/if}
	{#if props.children}
		{@render props.children()}
	{/if}
	{@render props.bottomNav?.()}
</div>
