<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	let { ...props }: HTMLAttributes<HTMLHRElement> = $props();
</script>

<hr
	{...props}
	class={["border-white/10 my-1", props.class]}
/>
