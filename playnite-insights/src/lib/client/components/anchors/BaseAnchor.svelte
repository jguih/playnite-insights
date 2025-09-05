<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { BaseAnchorProps } from './types';

	let props: BaseAnchorProps = $props();
</script>

<a
	{...props}
	class={['cursor-pointer p-1', props.class]}
	transition:fade={{ duration: 150 }}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</a>
