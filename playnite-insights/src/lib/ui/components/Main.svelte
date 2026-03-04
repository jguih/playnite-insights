<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	let {
		main = $bindable(),
		...props
	}: HTMLAttributes<HTMLElement> & { main?: HTMLElement | null } = $props();
</script>

<main
	{...props}
	bind:this={main}
	class={["overflow-y-auto overflow-x-hidden p-4 bg-background", props.class]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</main>
