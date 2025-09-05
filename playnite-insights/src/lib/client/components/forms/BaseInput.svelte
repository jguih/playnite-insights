<script lang="ts">
	import type { BaseInputProps } from './types';

	let { value = $bindable<BaseInputProps['value']>(), ...props }: BaseInputProps = $props();
</script>

<input
	class={['m-0 w-full p-0 outline-0', props.class]}
	bind:value
/>
