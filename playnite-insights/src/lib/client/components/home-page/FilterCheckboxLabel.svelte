<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	let props: HTMLLabelAttributes = $props();
</script>

<label {...props} class={`text-md flex flex-row items-center gap-2 p-2 ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</label>
