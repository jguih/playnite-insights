<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseInputProps } from './types';

	let {
		value = $bindable<BaseInputProps['value']>(),
		input = $bindable(),
		onMount: fnOnMount,
		...props
	}: BaseInputProps = $props();

	onMount(() => {
		fnOnMount?.({ input });
	});
</script>

<input
	{...props}
	class={['m-0 w-full p-0 outline-0', props.class]}
	bind:value
	bind:this={input}
/>
