<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	const props: HTMLAttributes<HTMLElement> = $props();
</script>

<p class={["text-sm text-center font-medium whitespace-nowrap w-18 grow-0 truncate", props.class]}>
	{@render props.children?.()}
</p>
