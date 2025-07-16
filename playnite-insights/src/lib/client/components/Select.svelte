<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		value = $bindable<string | number>(),
		...props
	}: { value?: string | number | null } & Omit<HTMLSelectAttributes, 'value'> = $props();
</script>

<select
	{...props}
	class={`bg-background-1 active:border-primary-500 focus:border-primary-500 border-2 border-solid border-transparent p-2 text-lg text-white outline-0 ${props.class ?? ''}`}
	bind:value
>
	{#if props.children}
		{@render props.children()}
	{/if}
</select>
