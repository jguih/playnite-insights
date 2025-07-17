<script lang="ts">
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';
	import LightButton from '../buttons/LightButton.svelte';
	import { onMount, type Snippet } from 'svelte';

	let {
		body,
		button,
		...props
	}: {
		body?: Snippet;
		button: Snippet<[{ onclick: MouseEventHandler<HTMLButtonElement> }]>;
	} & HTMLAttributes<HTMLDivElement> = $props();
	let container: HTMLDivElement;
	let show: boolean = $state(false);

	const handleClickOutside: EventListener = (event) => {
		if (event.target instanceof Node && !container.contains(event.target)) {
			show = false;
		}
	};

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div bind:this={container} {...props} class={`w-fit ${props.class ?? ''}`}>
	{@render button({ onclick: () => (show = !show) })}
	{#if body}
		{#if show}
			{@render body()}
		{/if}
	{/if}
</div>
