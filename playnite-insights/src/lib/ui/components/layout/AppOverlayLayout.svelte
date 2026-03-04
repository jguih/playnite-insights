<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Props = HTMLAttributes<HTMLDivElement>;

	let props: Props = $props();
</script>

<div
	{...props}
	class={["fixed inset-0 pointer-events-none flex justify-center z-100", props.class]}
>
	{@render props.children?.()}
</div>
