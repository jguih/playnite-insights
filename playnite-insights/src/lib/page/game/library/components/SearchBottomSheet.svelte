<script lang="ts">
	import type { GameLibraryFilter } from "$lib/modules/game-library/domain";
	import LightButton from "$lib/ui/components/buttons/LightButton.svelte";
	import Input from "$lib/ui/components/forms/Input.svelte";
	import Icon from "$lib/ui/components/Icon.svelte";
	import AsideBody from "$lib/ui/components/sidebar/AsideBody.svelte";
	import BottomSheet from "$lib/ui/components/sidebar/BottomSheet.svelte";
	import { ArrowLeftIcon, HistoryIcon } from "@lucide/svelte";
	import { onDestroy, onMount } from "svelte";
	import type { EventHandler, FormEventHandler } from "svelte/elements";
	import { SvelteSet } from "svelte/reactivity";
	import type { SearchBottomSheetProps } from "./search-bottom-sheet.types";

	let {
		onClose,
		onDestroy: OnCallerDestroy,
		value = $bindable(),
		onChange,
		libraryFilterItems,
		onApplyFilterItem,
	}: SearchBottomSheetProps = $props();

	let input: HTMLInputElement | undefined = $state(undefined);

	const uniqueFilterItems = $derived.by(() => {
		const items = [...(libraryFilterItems ?? [])];
		const itemsSearchKeys = new SvelteSet<string>();
		const uniqueItems: GameLibraryFilter[] = [];

		items.forEach((i) => {
			const search = i.Query.filter?.searchNormalized;
			if (!search || search === "") return;
			if (itemsSearchKeys.has(search)) return;
			uniqueItems.push(i);
			itemsSearchKeys.add(search);
		});

		return uniqueItems;
	});

	const handleSubmit: EventHandler<SubmitEvent> = (event) => {
		event.preventDefault();
		onClose();
	};

	const handleInput: FormEventHandler<HTMLInputElement> = (event) => {
		const value = event.currentTarget.value;
		onChange?.(value);
	};

	onMount(() => {
		requestAnimationFrame(() => {
			if (input) input.focus();
		});
	});

	onDestroy(() => {
		OnCallerDestroy();
	});
</script>

<BottomSheet {onClose}>
	<div class="grid grid-rows-[5rem_1fr] h-dvh w-full overflow-hidden">
		<header class="flex gap-2 p-4">
			<LightButton
				variant="neutral"
				iconOnly
				onclick={onClose}
			>
				<Icon>
					<ArrowLeftIcon />
				</Icon>
			</LightButton>
			<form
				onsubmit={handleSubmit}
				class="w-full"
			>
				<Input
					variant="primary"
					enterkeyhint="done"
					class="w-full"
					placeholder="Search..."
					bind:input
					bind:value
					oninput={handleInput}
				/>
			</form>
		</header>
		<AsideBody class="min-h-0 w-full overflow-y-auto overflow-x-hidden pt-0!">
			<ul>
				{#each uniqueFilterItems as item (item.Key)}
					<li>
						<LightButton
							size="lg"
							variant="neutral"
							class="w-full flex justify-start"
							onclick={() => onApplyFilterItem?.(item)}
						>
							<div class="flex gap-8 w-full items-center">
								<Icon size="lg">
									<HistoryIcon />
								</Icon>
								<span>{item.Query.filter?.search}</span>
							</div>
						</LightButton>
					</li>
				{/each}
			</ul>
		</AsideBody>
	</div>
</BottomSheet>
