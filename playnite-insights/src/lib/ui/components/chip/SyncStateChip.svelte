<script lang="ts">
	import type { EntitySyncStateProps } from "$lib/modules/common/common";
	import { CheckCircle2Icon, CircleAlertIcon, CircleXIcon } from "@lucide/svelte";
	import { onMount, tick } from "svelte";
	import { cubicInOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import Icon from "../Icon.svelte";
	import SolidChip from "./SolidChip.svelte";
	import type { ChipProps } from "./chip.types";

	const {
		Status,
		collapseText = true,
		...props
	}: EntitySyncStateProps & ChipProps & { collapseText?: boolean } = $props();

	let showText: boolean = $state(true);
	let textEl: HTMLElement | undefined = $state();
	let timeout: ReturnType<typeof setTimeout>;

	const statusMap = {
		pending: { icon: "⚠️", label: "Pending" },
		synced: { icon: "✅", label: "Synced" },
		error: { icon: "❌", label: "Error" },
	};

	onMount(() => {
		if (!collapseText) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					timeout = setTimeout(() => {
						showText = false;
					}, 2_000);
					observer.disconnect();
				}
			},
			{
				root: null,
				threshold: 0,
			},
		);

		void (async () => {
			await tick();
			if (textEl) {
				observer.observe(textEl);
			}
		})();

		return () => {
			if (observer) observer.disconnect();
			if (timeout) clearTimeout(timeout);
		};
	});
</script>

<SolidChip
	{...props}
	class={["px-1.5! shadow-md", props.class]}
	variant={Status === "synced" ? "success" : Status === "pending" ? "warning" : "error"}
>
	<Icon>
		{#if Status === "synced"}
			<CheckCircle2Icon />
		{:else if Status === "pending"}
			<CircleAlertIcon />
		{:else}
			<CircleXIcon />
		{/if}
	</Icon>
	{#if showText}
		<span
			transition:fade={{ duration: 300, easing: cubicInOut }}
			bind:this={textEl}
		>
			{statusMap[Status].label}
		</span>
	{/if}
</SolidChip>
