<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import BaseAnchor from './BaseAnchor.svelte';

	let props: HTMLAnchorAttributes = $props();
</script>

<BaseAnchor {...props} class={`text-primary-light-active-fg ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAnchor>
