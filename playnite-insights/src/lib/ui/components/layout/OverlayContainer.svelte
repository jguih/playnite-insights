<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Props = HTMLAttributes<HTMLDivElement>;

	let props: Props = $props();
</script>

<div
	{...props}
	class={["relative h-full w-full max-w-100 pointer-events-none", props.class]}
>
	{@render props.children?.()}
</div>
