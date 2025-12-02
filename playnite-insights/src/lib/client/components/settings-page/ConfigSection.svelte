<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Divider from '../Divider.svelte';

	const { title, ...props }: HTMLAttributes<HTMLElement> & { title: string } = $props();
</script>

<section
	{...props}
	class={['bg-background-1 p-4 shadow', props.class]}
>
	<h1 class="text-xl font-bold">{title}</h1>
	<Divider class={['mb-4 border-1']} />
	{@render props.children?.()}
</section>
