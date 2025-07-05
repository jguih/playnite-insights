<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import MenuButton from './MenuButton.svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { ...props }: HTMLButtonAttributes = $props();
</script>

<MenuButton onclick={() => history.back()} class={`${props.class ?? ''}`} {...props}>
	<ArrowLeft />
</MenuButton>
