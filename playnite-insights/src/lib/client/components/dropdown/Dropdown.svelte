<script lang="ts">
	import { onMount } from 'svelte';
	import type { DropdownProps } from './types';

	let {
		body,
		button,
		hideOnClickOutside = false,
		initialState = false,
		...props
	}: DropdownProps = $props();
	let container: HTMLDivElement;
	let show: boolean = $state(initialState);

	const handleClickOutside: EventListener = (event) => {
		if (event.target instanceof Node && !container.contains(event.target)) {
			show = false;
		}
	};

	onMount(() => {
		if (hideOnClickOutside) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div
	bind:this={container}
	{...props}
	class={[props.class]}
>
	{@render button({ onclick: () => (show = !show), show })}
	{#if body}
		{#if show}
			{@render body()}
		{/if}
	{/if}
</div>
