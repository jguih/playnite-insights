<script lang="ts">
	import { buildClassNames } from '$lib/client/utils/build-class-names';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let props: HTMLAnchorAttributes & { disabled?: boolean; selected?: boolean } = $props();
	let disabled = $derived(props.disabled ?? false);
	let selected = $derived(props.selected ?? false);

	const classes = $derived(
		buildClassNames(
			{
				['cursor-not-allowed text-neutral-500 hover:border-primary-950 hover:text-primary-950']:
					disabled,
				['text-primary-500']: selected
			},
			`hover:text-primary-500 hover:border-primary-500 active:border-primary-500 focus:border-primary-500 border-2 border-solid border-transparent p-2 outline-0 cursor-pointer ${props.class}`
		)
	);
</script>

<a {...props} class={classes}>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
