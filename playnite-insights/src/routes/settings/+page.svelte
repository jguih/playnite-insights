<script lang="ts">
	import {
		clientServiceLocator,
		loadGameNotesFromServer,
		withHttpClient,
	} from '$lib/client/app-state/AppData.svelte';
	import { toast } from '$lib/client/app-state/toast.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import SolidButton from '$lib/client/components/buttons/SolidButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Select from '$lib/client/components/forms/Select.svelte';
	import Header from '$lib/client/components/header/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Loading from '$lib/client/components/Loading.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import ConfigSection from '$lib/client/components/settings-page/ConfigSection.svelte';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, setLocale, type Locale } from '$lib/paraglide/runtime';
	import { AlertCircle, CheckCircle } from '@lucide/svelte';
	import {
		EmptyStrategy,
		getAllExtensionRegistrationsSchema,
		JsonStrategy,
		type ExtensionRegistration,
	} from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';
	import type { ChangeEventHandler } from 'svelte/elements';

	let currentLocale = $state(getLocale());
	let serverConnectionStatusText = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatusText,
	);
	let serverConnectionStatus = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatus,
	);
	let extensionRegistrationsSignal = $state<{
		isLoading: boolean;
		registrations: ExtensionRegistration[] | null;
	}>({ isLoading: false, registrations: null });

	const loadExtensionRegistrations = async () => {
		if (!clientServiceLocator.serverHeartbeat.isAlive) return;
		try {
			extensionRegistrationsSignal.isLoading = true;
			await withHttpClient(async ({ client }) => {
				const result = await client.httpGetAsync({
					endpoint: '/api/extension-registration',
					strategy: new JsonStrategy(getAllExtensionRegistrationsSchema),
				});
				extensionRegistrationsSignal.registrations = result.registrations;
			});
		} catch (err) {
			handleClientErrors(
				err,
				`[loadExtensionRegistrations] failed to fetch /api/extension-registration`,
			);
		} finally {
			extensionRegistrationsSignal.isLoading = false;
		}
	};

	const handleOnChangeRegistration = async (
		registrationId: ExtensionRegistration['Id'],
		action: 'revoke' | 'remove' | 'reject' | 'approve',
	) => {
		try {
			await withHttpClient(async ({ client }) => {
				await client.httpPostAsync({
					endpoint: `/api/extension-registration/${registrationId}/${action}`,
					strategy: new EmptyStrategy(),
					body: {},
				});
			});
			const index =
				extensionRegistrationsSignal.registrations?.findIndex((r) => r.Id === registrationId) ?? -1;
			if (index > -1) {
				switch (action) {
					case 'approve':
						extensionRegistrationsSignal.registrations![index].Status = 'trusted';
						break;
					case 'revoke':
					case 'reject':
						extensionRegistrationsSignal.registrations![index].Status = 'rejected';
						break;
					case 'remove':
						extensionRegistrationsSignal.registrations =
							extensionRegistrationsSignal.registrations?.filter((r) => r.Id !== registrationId) ??
							null;
						break;
				}
			}
		} catch (err) {
			handleClientErrors(
				err,
				`[handleOnRevokeRegistration] failed to ${action} registration /api/extension-registration/${registrationId}/${action}`,
			);
		}
	};

	const isValidLocale = (value: string): value is Locale => {
		return locales.includes(value as Locale);
	};

	const handleOnChangeLocale: ChangeEventHandler<HTMLSelectElement> = (e) => {
		const value = e.currentTarget.value;
		if (isValidLocale(value)) setLocale(value);
	};

	const handleOnDataSync = async () => {
		const syncResult = await clientServiceLocator.syncQueue.processQueueAsync();
		const loadResult = syncResult ? await loadGameNotesFromServer(true) : false;
		if (!syncResult || !loadResult) {
			toast.error({ category: 'app', message: m.toast_data_sync_failed() });
			return;
		}
		toast.success({ category: 'app', message: m.toast_data_sync_succeeded() });
	};

	const handleSSENewRegistration = (newRegistration: ExtensionRegistration) => {
		let newRegistrations: ExtensionRegistration[] = [newRegistration];
		const index =
			extensionRegistrationsSignal.registrations?.findIndex((r) => r.Id === newRegistration.Id) ??
			-1;
		if (index > -1) {
			newRegistrations = [...extensionRegistrationsSignal.registrations!];
			newRegistrations[index] = newRegistration;
		}
		extensionRegistrationsSignal.registrations = newRegistrations;
	};

	onMount(() => {
		loadExtensionRegistrations();
		const unsub = clientServiceLocator.eventSourceManager.addListener({
			type: 'createdExtensionRegistration',
			cb: ({ data }) => handleSSENewRegistration(data),
		});
		return () => {
			unsub();
		};
	});
</script>

{#snippet registrationInfo(label: string, value: string | number)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-nowrap text-sm">{label}</p>
		<p class="break-all text-sm opacity-80">{value}</p>
	</div>
	<Divider class={['border-background-3']} />
{/snippet}

{#snippet registrationCard(registration: ExtensionRegistration)}
	<div class="bg-background-2 flex flex-col p-4">
		<div class="flex flex-row justify-between gap-4">
			<p>{m.exporter_registration_status()}</p>
			{#if registration.Status === 'pending'}
				<p class="text-warning-light-fg">{m.exporter_registration_status_pending()}</p>
			{:else if registration.Status === 'rejected'}
				<p class="text-error-light-fg">{m.exporter_registration_status_rejected()}</p>
			{:else}
				<p class="text-success-light-fg">{m.exporter_registration_status_approved()}</p>
			{/if}
		</div>
		<Divider class={['border-background-3']} />
		{@render registrationInfo(m.extension_registration_info_id(), registration.Id)}
		{@render registrationInfo(
			m.extension_registration_info_extension_id(),
			registration.ExtensionId,
		)}
		{@render registrationInfo('OS', registration.Os ?? '')}
		{@render registrationInfo(
			m.extension_registration_info_version(),
			registration.ExtensionVersion ?? '',
		)}
		{@render registrationInfo(m.created_at(), new Date(registration.CreatedAt).toLocaleString())}
		{@render registrationInfo(
			m.updated_at(),
			new Date(registration.LastUpdatedAt).toLocaleString(),
		)}
		<div class="mt-2 flex justify-end gap-2">
			{#if registration.Status === 'pending'}
				<SolidButton
					class={['w-20']}
					color="error"
					onclick={() => handleOnChangeRegistration(registration.Id, 'reject')}
				>
					{m.label_exporter_registration_reject()}
				</SolidButton>
				<SolidButton
					class={['w-20']}
					color="primary"
					onclick={() => handleOnChangeRegistration(registration.Id, 'approve')}
				>
					{m.label_exporter_registration_approve()}
				</SolidButton>
			{:else if registration.Status === 'rejected'}
				<SolidButton
					class={['w-20']}
					color="neutral"
					onclick={() => handleOnChangeRegistration(registration.Id, 'remove')}
				>
					{m.label_exporter_registration_delete()}
				</SolidButton>
			{:else}
				<SolidButton
					class={['w-20']}
					color="error"
					onclick={() => handleOnChangeRegistration(registration.Id, 'revoke')}
				>
					{m.label_exporter_registration_rekove()}
				</SolidButton>
			{/if}
		</div>
	</div>
{/snippet}

<BaseAppLayout>
	<Header class={['flex items-center justify-center']}>
		<h1 class="block h-fit w-fit text-lg">
			{m.bottom_nav_label_settings()}
		</h1>
	</Header>
	<Main class={['flex flex-col gap-4']}>
		<div class="flex w-full justify-end">
			{#if serverConnectionStatus === true}
				<p class="text-success-light-fg wrap-normal block text-sm">
					{serverConnectionStatusText}
					<CheckCircle class={['size-sm inline-block']} />
				</p>
			{:else}
				<p class="text-warning-light-fg wrap-normal block text-sm">
					{serverConnectionStatusText}
					<AlertCircle class={['size-sm inline-block']} />
				</p>
			{/if}
		</div>
		<ConfigSection title={m.settings_playatlas_exporter_section_title()}>
			<p class="mb-4 text-sm">
				{@html m.settings_playatlas_exporter_section_summary({
					begin_strong: '<strong>',
					end_strong: '</strong>',
				})}
			</p>
			<h2 class="text-lg">
				{m.settings_playatlas_exporter_section_registration_subsection_title()}
			</h2>
			<Divider class={['border-1 mb-4']} />
			<p class="mb-4 text-sm">
				{@html m.settings_playatlas_exporter_section_registration_subsection_summary({
					begin_strong: '<strong>',
					end_strong: '</strong>',
				})}
			</p>
			<div class="flex max-h-[56dvh] flex-col gap-4 overflow-y-auto">
				{#if extensionRegistrationsSignal.isLoading}
					<Loading />
				{:else if extensionRegistrationsSignal.registrations && extensionRegistrationsSignal.registrations.length > 0}
					{#each extensionRegistrationsSignal.registrations as registration (registration.Id)}
						{@render registrationCard(registration)}
					{/each}
				{:else}
					<div class="bg-background-2 p-2">
						<p class="block w-full text-center">Nenhum registro encontrado</p>
					</div>
				{/if}
			</div>
		</ConfigSection>
		<ConfigSection title={m.settings_language_section_title()}>
			<p class="mb-4 text-sm">{m.settings_language_section_summary()}</p>
			<label
				for="settings-language"
				class="flex flex-col items-start gap-2"
			>
				{m.settings_language_section_label_language_picker()}
				<Select
					onchange={handleOnChangeLocale}
					id="settings-language"
					class={['bg-background-2! w-full']}
					value={currentLocale}
				>
					{#each locales as locale (locale)}
						<option value={locale}>
							{m.language_name({}, { locale: locale })}
						</option>
					{/each}
				</Select>
			</label>
		</ConfigSection>
		<ConfigSection title={m.settings_sync_section_title()}>
			<p class="text-sm">
				{m.settings_sync_section_summary_paragraph1()}
			</p>
			<p class="mb-4 mt-2 text-sm">
				{m.settings_sync_section_summary_paragraph2()}
			</p>
			<SolidButton
				class={['w-full']}
				onclick={handleOnDataSync}
				disabled={!clientServiceLocator.serverHeartbeat.isAlive}
			>
				{m.settings_sync_section_label_sync()}
			</SolidButton>
		</ConfigSection>
	</Main>
	<BottomNav>
		<Home />
		<Dashboard />
		<Settings selected={true} />
	</BottomNav>
</BaseAppLayout>
