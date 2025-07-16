<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { checked = $bindable<boolean>(), ...props }: { checked: boolean } & HTMLInputAttributes =
		$props();
</script>

<input
	{...props}
	bind:checked
	type="checkbox"
	class={`accent-primary-500 hover:accent-primary-600 focus:ring-primary-700 h-4 w-4 focus:ring-2 ${props?.class ?? ''}`}
/>
