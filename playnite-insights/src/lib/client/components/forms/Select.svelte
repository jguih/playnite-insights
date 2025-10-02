<script lang="ts">
	import type { BaseSelectProps } from './types';

	let { value = $bindable<BaseSelectProps['value']>(null), ...props }: BaseSelectProps = $props();
</script>

<select
	{...props}
	class={[
		'bg-primary-light-bg',
		'text-foreground',
		'hover:text-primary-light-hover-fg',
		'active:text-primary-light-active-fg',
		'focus:ring-primary-light-active-fg focus:ring-2',
		'p-2 outline-0',
		props.class,
	]}
	bind:value
>
	{#if props.children}
		{@render props.children()}
	{/if}
</select>
