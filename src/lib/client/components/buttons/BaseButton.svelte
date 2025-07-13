<script lang="ts">
	import type { BaseButtonProps } from './types';

	let {
		size = 'md',
		button = $bindable<HTMLButtonElement>(),
		...props
	}: BaseButtonProps = $props();
	const getSizeClass = () => {
		switch (size) {
			case 'sm': {
				return 'w-5 h-6';
			}
			case 'md': {
				return 'w-9 h-9';
			}
			case 'lg': {
				return 'w-11 h-11';
			}
		}
	};
</script>

<button
	{...props}
	class={`disabled:hover:border-primary-950 disabled:hover:text-primary-950 m-0 flex cursor-pointer flex-row items-center justify-center gap-1 p-0 outline-0 disabled:text-neutral-500 ${getSizeClass()} ${props.class ?? ''}`}
	bind:this={button}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</button>
