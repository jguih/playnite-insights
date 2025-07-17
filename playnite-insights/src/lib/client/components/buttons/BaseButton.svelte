<script lang="ts">
	import type { BaseButtonProps } from './types';

	let { button = $bindable<HTMLButtonElement>(), ...props }: BaseButtonProps = $props();
</script>

<button
	{...props}
	class={`disabled:hover:border-primary-950 disabled:hover:text-primary-950 m-0 flex cursor-pointer flex-row items-center justify-center gap-1 p-0 outline-0 disabled:text-neutral-500 ${props.class ?? ''}`}
	bind:this={button}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
