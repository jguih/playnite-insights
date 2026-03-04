<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	const props: HTMLAttributes<HTMLElement> = $props();
</script>

<div class={["flex flex-col items-center justify-center gap-1", props.class]}>
	{@render props.children?.()}
</div>
