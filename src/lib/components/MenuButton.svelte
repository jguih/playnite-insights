<script lang="ts">
	import { buildClassNames } from '$lib/utils/build-class-names';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let props: HTMLButtonAttributes & { selected?: boolean } = $props();

	let classes = $derived(
		buildClassNames(
			{ ['bg-primary-500 hover:bg-primary-700 hover:border-primary-800']: props.selected },
			`hover:text-primary-500 disabled:hover:border-primary-950 disabled:hover:text-primary-950 hover:border-primary-500 active:border-primary-500 focus:border-primary-500 cursor-pointer border-2 border-solid border-transparent p-2 outline-0 disabled:text-neutral-500 ${props?.class ?? ''}`
		)
	);
</script>

<button {...props} class={classes}>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
