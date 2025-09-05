<script lang="ts">
	import type { BaseButtonProps } from './types';

	let {
		button = $bindable<HTMLButtonElement>(),
		justify = 'center',
		...props
	}: BaseButtonProps = $props();
</script>

<button
	{...props}
	class={[
		'm-0 flex cursor-pointer flex-row items-center gap-1 outline-0',
		justify === 'center' && 'justify-center',
		justify === 'between' && 'justify-between',
		props.class,
	]}
	bind:this={button}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
