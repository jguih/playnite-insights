<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ComponentSize } from './types';

	let { size = 'md', ...props }: HTMLAttributes<HTMLDivElement> & { size?: ComponentSize } =
		$props();
</script>

<div
	{...props}
	class={['my-2 flex w-full flex-col items-center justify-center', props.class]}
>
	<div
		class={[
			size === 'sm' && 'h-7 w-7',
			size === 'md' && 'h-8 w-8',
			size === 'lg' && 'h-10 w-10',
			'border-primary-light-active-fg mx-auto animate-spin rounded-full border-4 border-t-transparent',
		]}
	></div>
</div>
