<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={['my-2 flex w-full flex-col items-center justify-center', props.class]}
>
	<div
		class={[
			'border-primary-light-active-fg mx-auto h-10 w-10 animate-spin rounded-full border-4 border-t-transparent',
		]}
	></div>
</div>
