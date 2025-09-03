<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BaseAnchor from './BaseAnchor.svelte';

	let {selected, ...props}: {selected?: boolean} & HTMLAnchorAttributes = $props();
</script>

<BaseAnchor {...props} class={`flex flex-col items-center w-22 grow-0 ${selected && 'text-primary-500'} ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAnchor>
