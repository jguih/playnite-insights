<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let props: HTMLButtonAttributes & { selected?: boolean } = $props();
	const baseClass =
		'cursor-pointer border-2 border-solid border-transparent p-1 outline-0 flex flex-row justify-center gap-1';
	const hoverClass = 'hover:text-primary-500 hover:border-primary-500';
	const focusClass = 'active:border-primary-500 focus:border-primary-500';
	const disabledClass =
		'disabled:hover:border-primary-950 disabled:hover:text-primary-950 disabled:text-neutral-500';
	const selectedClass = 'text-primary-500';
	let stateClass = $derived(props.selected ? selectedClass : '');
	let fullClass = $derived(
		`${baseClass} ${disabledClass} ${hoverClass} ${focusClass} ${stateClass} ${props.class ?? ''}`
	);
</script>

<button {...props} class={fullClass}>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
