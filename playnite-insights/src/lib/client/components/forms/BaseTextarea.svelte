<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseTextareaProps } from './types';

	let {
		value = $bindable<BaseTextareaProps['value']>(),
		textArea = $bindable(),
		onMount: handleOnMount,
		...props
	}: BaseTextareaProps = $props();

	onMount(() => {
		handleOnMount?.({ textArea });
	});
</script>

<textarea
	{...props}
	class={['m-0 p-0 outline-0', props.class]}
	bind:value
	bind:this={textArea}
></textarea>
