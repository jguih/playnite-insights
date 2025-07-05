<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let props: HTMLAnchorAttributes & { disabled?: boolean; selected?: boolean } = $props();

	const baseClass = 'border-2 border-solid border-transparent p-1 outline-0';
	const hoverClass = 'hover:border-primary-500 hover:text-primary-500';
	const focusClass = 'focus:border-primary-500 active:border-primary-500';
	const disabledClass =
		'cursor-not-allowed text-neutral-500 hover:text-primary-950 hover:border-primary-950';
	const selectedClass = 'text-primary-500 cursor-pointer';
	const pointerClass = 'cursor-pointer';
	let stateClass = $derived(
		props.disabled
			? `${disabledClass}`
			: props.selected
				? `${selectedClass} ${pointerClass}`
				: `${pointerClass}`
	);
	let fullClass = $derived(
		`${baseClass} ${hoverClass} ${focusClass} ${stateClass} ${props.class ?? ''}`
	);
</script>

<a {...props} class={fullClass}>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
