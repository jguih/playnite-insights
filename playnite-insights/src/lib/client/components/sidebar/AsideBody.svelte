<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		bottomNav = false,
		header = true,
		onMount: handleOnMount,
		onDestroy: handleOnDetroy,
		...props
	}: HTMLAttributes<HTMLDivElement> & {
		bottomNav?: boolean;
		header?: boolean;
		onMount?: () => void | Promise<void>;
		onDestroy?: () => void | Promise<void>;
	} = $props();

	onMount(() => {
		handleOnMount?.();
	});

	onDestroy(() => {
		handleOnDetroy?.();
	});
</script>

<div
	{...props}
	class={[
		'absolute right-0 bottom-0 left-0 z-21 w-full overflow-y-auto p-4',
		bottomNav ? 'bottom-[3.4rem]' : 'bottom-0',
		header ? 'top-[var(--header-height)]' : 'top-0',
		props.class,
	]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
