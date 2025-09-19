<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Divider from '../Divider.svelte';

	const { title, ...props }: HTMLAttributes<HTMLElement> & { title: string } = $props();
</script>

<section
	{...props}
	class={['bg-background-1 p-4 shadow', props.class]}
>
	<h1 class="text-lg font-bold">{title}</h1>
	<Divider class={['border-1 mb-4']} />
	{@render props.children?.()}
</section>
