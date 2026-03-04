<script lang="ts">
	import { onMount, tick } from "svelte";
	import { cubicInOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	import OverlayContainer from "../layout/OverlayContainer.svelte";
	import Backdrop from "./Backdrop.svelte";
	import type { SidebarProps } from "./types";

	let { width = 80, onClose, ...props }: SidebarProps = $props();
	let showChildren = $state(false);
	let asideEl: HTMLElement;
	let previousFocus: HTMLElement | null = null;

	onMount(() => {
		previousFocus = document.activeElement as HTMLElement;

		tick()
			.then(() => {
				showChildren = true;
				asideEl.focus();
			})
			.catch(() => {});

		const handleOnKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose?.();
		};

		window.addEventListener("keydown", handleOnKeyDown);

		return () => {
			window.removeEventListener("keydown", handleOnKeyDown);
			previousFocus?.focus();
		};
	});
</script>

<OverlayContainer>
	<Backdrop onclick={onClose} />
	<aside
		{...props}
		bind:this={asideEl}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		class={[
			"absolute bottom-0 left-0 top-0",
			"h-full max-w-full",
			"bg-background-1 overflow-y-hidden shadow-md pointer-events-auto",
			props.class,
		]}
		style:width={`min(${width}%, 28rem)`}
		transition:fly={{ x: `-${width}%`, duration: 200, easing: cubicInOut }}
	>
		{#if props.children && showChildren}
			{@render props.children()}
		{/if}
	</aside>
</OverlayContainer>
