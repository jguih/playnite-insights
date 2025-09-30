<script lang="ts">
	import Loading from '../Loading.svelte';
	import type { BaseButtonProps } from './types';

	let {
		button = $bindable<HTMLButtonElement>(),
		justify = 'center',
		rounded = false,
		size = 'sm',
		isLoading = false,
		...props
	}: BaseButtonProps = $props();
</script>

<button
	type="button"
	{...props}
	class={[
		'm-0 flex cursor-pointer flex-row items-center gap-2 outline-0',
		justify === 'center' && 'justify-center',
		justify === 'between' && 'justify-between',
		rounded && 'rounded-full p-2',
		size === 'sm' && 'p-1',
		size === 'md' && 'px-1 py-2',
		size === 'lg' && 'px-3 py-2 text-lg',
		props.class,
	]}
	bind:this={button}
	disabled={isLoading}
>
	{#if isLoading}
		<Loading size="sm" />
	{/if}
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
