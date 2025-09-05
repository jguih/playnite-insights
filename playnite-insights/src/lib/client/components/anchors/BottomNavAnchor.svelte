<script lang="ts">
	import LightAnchor from './LightAnchor.svelte';
	import type { LightAnchorProps } from './types';

	let props: LightAnchorProps = $props();
</script>

<LightAnchor
	{...props}
	class={['w-22 flex grow-0 flex-col items-center', props.class]}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</LightAnchor>
