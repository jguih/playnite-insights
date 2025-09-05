<script lang="ts">
	import type { BaseTextareaProps } from './types';

	let { value = $bindable<BaseTextareaProps['value']>(), ...props }: BaseTextareaProps = $props();
</script>

<textarea
	{...props}
	class={['m-0 p-0 outline-0', props.class]}
	bind:value
></textarea>
