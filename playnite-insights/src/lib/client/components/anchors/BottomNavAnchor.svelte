<script lang="ts">
	import LightAnchor from './LightAnchor.svelte';
	import type { LightAnchorProps } from './types';

	let props: LightAnchorProps = $props();
</script>

<LightAnchor
	{...props}
	class={['flex w-22 grow-0 flex-col items-center', props.class]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</LightAnchor>
