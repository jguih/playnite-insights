<script lang="ts">
	import type { BaseCheckboxProps } from './types';

	let { checked = $bindable<boolean>(), color = 'primary', ...props }: BaseCheckboxProps = $props();
</script>

<input
	{...props}
	bind:checked
	type="checkbox"
	class={[
		color === 'primary' && [
			'accent-primary-light-active-fg',
			'hover:accent-primary-light-hover-fg',
			'focus:ring-primary-light-active-fg focus:ring-2',
		],
		props.class,
	]}
/>
