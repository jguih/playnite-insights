<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		value = $bindable(),
		...props
	}: { value: ReturnType<typeof $bindable> } & Omit<HTMLSelectAttributes, 'value'> = $props();
</script>

<select {...props} class="bg-background-1 p-2 text-lg text-white {props?.class}" bind:value>
	{#if props.children}
		{@render props.children()}
	{/if}
</select>
