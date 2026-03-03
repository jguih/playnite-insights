<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	const props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={["p-2", props.class]}>
	{@render props.children?.()}
</div>
