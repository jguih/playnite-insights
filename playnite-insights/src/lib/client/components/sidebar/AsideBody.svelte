<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		bottomNav = false,
		header = true,
		...props
	}: HTMLAttributes<HTMLDivElement> & { bottomNav?: boolean; header?: boolean } = $props();
</script>

<div
	{...props}
	class={[
		'z-21 absolute bottom-0 left-0 right-0 w-full overflow-y-auto p-4',
		bottomNav ? 'bottom-[var(--bottom-nav-height)]' : 'bottom-0',
		header ? 'top-[var(--header-height)]' : 'top-0',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
