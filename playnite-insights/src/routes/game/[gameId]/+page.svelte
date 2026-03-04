<script lang="ts">
	import { resolve } from "$app/paths";
	import { getClientApiContext } from "$lib/modules/bootstrap/application";
	import { GameIdParser } from "$lib/modules/common/domain";
	import { GameAggregateStore, GameViewModel } from "$lib/page/game/gameId";
	import ActionButtonContainer from "$lib/page/game/gameId/components/ActionButtonContainer.svelte";
	import ActionButtonLabel from "$lib/page/game/gameId/components/ActionButtonLabel.svelte";
	import CompletionStatusButton from "$lib/page/game/gameId/components/CompletionStatusButton.svelte";
	import GameDetailSkeleton from "$lib/page/game/gameId/components/GameDetailSkeleton.svelte";
	import GameInfoSection from "$lib/page/game/gameId/components/GameInfoSection.svelte";
	import GenreBreakdown from "$lib/page/game/gameId/components/genre-breakdown/GenreBreakdown.svelte";
	import LightButton from "$lib/ui/components/buttons/LightButton.svelte";
	import SolidButton from "$lib/ui/components/buttons/SolidButton.svelte";
	import SolidChip from "$lib/ui/components/chip/SolidChip.svelte";
	import SyncStateChip from "$lib/ui/components/chip/SyncStateChip.svelte";
	import Header from "$lib/ui/components/header/Header.svelte";
	import Icon from "$lib/ui/components/Icon.svelte";
	import AppLayout from "$lib/ui/components/layout/AppLayout.svelte";
	import AppOverlayLayout from "$lib/ui/components/layout/AppOverlayLayout.svelte";
	import OverlayContainer from "$lib/ui/components/layout/OverlayContainer.svelte";
	import Main from "$lib/ui/components/Main.svelte";
	import { DurationFormatter, GameAssets } from "$lib/ui/utils";
	import { ArrowLeftIcon, ClockIcon, NotebookPenIcon } from "@lucide/svelte";
	import { onMount, tick } from "svelte";
	import { cubicInOut } from "svelte/easing";
	import { fade } from "svelte/transition";

	const { params } = $props();
	const getGameId = () => GameIdParser.fromTrusted(params.gameId);

	const api = getClientApiContext();
	const store = new GameAggregateStore({ api, getGameId });
	const vm = new GameViewModel({ gameAggregateStore: store });
	const initPromise = store.initAsync();
	let loading: boolean = $state(true);
	let heroTitleEl: HTMLElement | undefined = $state();
	let showHeaderTitle = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				showHeaderTitle = !entry.isIntersecting;
			},
			{
				root: null,
				threshold: 0,
				rootMargin: "-72px 0px 0px 0px",
			},
		);

		void initPromise
			.then(async () => {
				await tick();
				loading = false;
				await tick();
				if (heroTitleEl) observer.observe(heroTitleEl);
			})
			.catch(() => (loading = false));

		return () => observer.disconnect();
	});

	$inspect(store.latestGameClassifications?.get("HORROR"));
	$inspect(store.latestGameClassifications?.get("RUN-BASED"));
	$inspect(store.latestGameClassifications?.get("SURVIVAL"));
</script>

<AppOverlayLayout>
	<OverlayContainer>
		<Header
			class={[
				"transition-colors duration-150 ease-out sticky inset-x-0 top-0 z-20 border-b",
				showHeaderTitle
					? "bg-background-1 shadow border-b-neutral-700/60"
					: "bg-transparent shadow-none border-b-transparent",
			]}
		>
			<div class="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/60 to-transparent"></div>
			<div class="relative mr-auto w-fit pointer-events-auto flex items-center gap-1">
				<LightButton
					variant="neutral"
					iconOnly
					onclick={() => history.back()}
				>
					<Icon>
						<ArrowLeftIcon />
					</Icon>
				</LightButton>
				{#if showHeaderTitle}
					<p
						class={["font-semibold leading-tight text-lg truncate max-w-[70dvw]"]}
						transition:fade={{ duration: 150, easing: cubicInOut }}
					>
						{store.game?.Playnite?.Name}
					</p>
				{/if}
			</div>
		</Header>
	</OverlayContainer>
</AppOverlayLayout>

<AppLayout>
	<Main class="p-0!">
		{#if loading}
			<GameDetailSkeleton />
		{:else if !store.game}
			<p class="text-error-light-fg">Game not found</p>
		{:else}
			<div transition:fade={{ duration: 150, easing: cubicInOut }}>
				<div class="relative">
					<div class="h-[50dvh] w-full overflow-hidden">
						<img
							src={resolve(`/api/assets/image/[...params]`, {
								params: GameAssets.parseBackgroundImageParams(
									store.game.Playnite?.BackgroundImagePath,
								),
							})}
							alt={`Background of ${store.game.Playnite?.Name}`}
							loading="eager"
							decoding="sync"
							fetchpriority="high"
							class="h-full w-full object-cover blur-xs scale-105"
						/>

						<div class="absolute inset-0 bg-black/20 z-1"></div>

						<div
							class={[
								"absolute inset-x-0 -bottom-1 h-40 z-2",
								"bg-linear-to-t from-background via-background/80 to-transparent",
							]}
						></div>
					</div>

					<div class="absolute left-0 px-6 bottom-12 translate-y-1/2 flex gap-4 items-end z-3">
						<div class="relative min-w-40 max-w-40 aspect-2/3">
							<img
								src={resolve(`/api/assets/image/[...params]`, {
									params: GameAssets.parseCoverImageParams(store.game.Playnite?.CoverImagePath),
								})}
								alt={`Cover of ${store.game.Playnite?.Name}`}
								loading="eager"
								decoding="sync"
								fetchpriority="high"
								class="w-full h-full object-cover shadow-2xl"
							/>

							<div class="absolute right-2 bottom-2">
								<SyncStateChip
									{...store.game.Sync}
									class="text-xs!"
								/>
							</div>
						</div>

						<div
							class="pb-2 overflow-hidden"
							bind:this={heroTitleEl}
						>
							<h1
								class="text-2xl font-semibold leading-tight drop-shadow-md mb-2 flex-1 min-w-0 whitespace-normal wrap-anywhere"
							>
								{store.game.Playnite?.Name}
							</h1>

							<div class="flex gap-1 flex-wrap">
								{#each vm.strongestClassificationsLabelSignal as classificationLabel, i (classificationLabel)}
									<SolidChip
										class="text-xs"
										variant={i > 0 ? "neutral" : "primary"}
									>
										{classificationLabel}
									</SolidChip>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="px-6 pt-24 pb-6 flex flex-col gap-6 z-3">
					<div class="flex justify-between">
						<CompletionStatusButton completionStatus={store.completionStatus} />
						<ActionButtonContainer>
							<SolidButton
								iconOnly
								size="xl"
								class="text-4xl!"
							>
								<Icon><ClockIcon /></Icon>
							</SolidButton>
							<ActionButtonLabel>Activity</ActionButtonLabel>
						</ActionButtonContainer>
						<ActionButtonContainer>
							<SolidButton
								iconOnly
								size="xl"
								class="text-4xl!"
							>
								<Icon><NotebookPenIcon /></Icon>
							</SolidButton>
							<ActionButtonLabel>Journal</ActionButtonLabel>
						</ActionButtonContainer>
					</div>

					{#if vm.classificationsBreakdownSignal.size > 0}
						<GameInfoSection title="Genre Breakdown">
							<GenreBreakdown classificationsBreakdownSignal={vm.classificationsBreakdownSignal} />
						</GameInfoSection>
					{/if}

					<GameInfoSection
						title="Installation"
						class="flex gap-2 flex-col"
					>
						<div class="flex items-center gap-2 flex-nowrap min-w-0">
							<SolidChip variant={store.game.Playnite?.IsInstalled ? "success" : "neutral"}>
								<span
									class={[
										"size-2 rounded-full",
										store.game.Playnite?.IsInstalled ? "bg-success-bg" : "bg-foreground/40",
									]}
								></span>

								{store.game.Playnite?.IsInstalled ? "Installed" : "Not installed"}
							</SolidChip>

							{#if store.game.Playnite?.IsInstalled}
								{#if store.game.Playnite?.InstallDirectory}
									<SolidChip
										class="bg-background-1! text-foreground/80! min-w-0 flex-1"
										title={store.game.Playnite?.InstallDirectory}
									>
										📂
										<span class="truncate">
											{store.game.Playnite?.InstallDirectory}
										</span>
									</SolidChip>
								{:else}
									<SolidChip
										variant="warning"
										class="min-w-0 flex-1"
									>
										<span class="truncate">⚠ Install path unavailable</span>
									</SolidChip>
								{/if}
							{/if}
						</div>
					</GameInfoSection>

					{#snippet detailSection(label: string, value?: string)}
						<div class="flex justify-between gap-4">
							<span class="text-foreground/80 font-medium">{label}</span>
							<span class="font-medium text-end">{value}</span>
						</div>
					{/snippet}

					<GameInfoSection
						title="Activity"
						class="flex gap-2 flex-col"
					>
						{@render detailSection(
							"Last Played",
							store.game.Playnite?.LastActivity?.toLocaleString(),
						)}
						{@render detailSection(
							"Playtime",
							DurationFormatter.toHoursMinutesSeconds(store.game.Playnite?.Playtime ?? 0),
						)}
					</GameInfoSection>

					<GameInfoSection
						title="Details"
						class="flex gap-2 flex-col"
					>
						{@render detailSection(
							"Released",
							store.game.Playnite?.ReleaseDate?.toLocaleDateString(),
						)}
						{@render detailSection("Added", store.game.Playnite?.Added?.toLocaleDateString())}
						{@render detailSection("Hidden", store.game.Playnite?.Hidden ? "Yes" : "No")}
						{@render detailSection("Developers", vm.developersStringSignal)}
						{@render detailSection("Publishers", vm.publishersStringSignal)}
					</GameInfoSection>

					<GameInfoSection
						title="Synchronization"
						class="flex gap-2 flex-col"
					>
						<div class="flex justify-between gap-2">
							<span class="text-foreground/80 font-medium">Status</span>
							<SyncStateChip
								{...store.game.Sync}
								collapseText={false}
							/>
						</div>
						{#if store.game.Sync.Status === "error"}
							{@render detailSection("Error Message", store.game.Sync.ErrorMessage ?? "")}
						{/if}
						{@render detailSection("Last Sync", store.game.Sync.LastSyncedAt.toLocaleString())}
					</GameInfoSection>
				</div>
			</div>
		{/if}
	</Main>
</AppLayout>
