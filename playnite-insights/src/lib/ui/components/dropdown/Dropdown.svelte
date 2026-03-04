<script lang="ts">
	import { ChevronDownIcon, ChevronRightIcon } from "@lucide/svelte";
	import type { Snippet } from "svelte";
	import { cubicOut } from "svelte/easing";
	import type { HTMLAttributes } from "svelte/elements";
	import { fade } from "svelte/transition";
	import LightButton from "../buttons/LightButton.svelte";
	import Icon from "../Icon.svelte";
	import type { ComponentSize } from "../types";

	type DropdownProps = HTMLAttributes<HTMLDivElement> & {
		label: Snippet;
		size?: ComponentSize;
	};

	const { label, size = "md", ...props }: DropdownProps = $props();
	let opened = $state(false);

	const toggleOpened = () => (opened = !opened);
</script>

<div>
	<LightButton
		onclick={() => toggleOpened()}
		justify="start"
		class={["w-full", props.class]}
		state={opened ? "selected" : "default"}
		{size}
	>
		<Icon>
			{#if !opened}
				<ChevronRightIcon />
			{:else}
				<ChevronDownIcon />
			{/if}
		</Icon>
		{@render label()}
	</LightButton>
	{#if opened}
		<div transition:fade={{ duration: 150, easing: cubicOut }}>
			{@render props.children?.()}
		</div>
	{/if}
</div>
