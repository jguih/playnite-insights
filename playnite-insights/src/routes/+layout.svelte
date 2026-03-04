<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { ClientCompositionRoot, type ClientApiV1 } from "$lib/modules/bootstrap/application";
	import { setClientApiContext } from "$lib/modules/bootstrap/application/client-api.context";
	import Main from "$lib/ui/components/Main.svelte";
	import Spinner from "$lib/ui/components/Spinner.svelte";
	import { onDestroy, onMount } from "svelte";
	import "../app.css";

	const { children } = $props();
	const root = new ClientCompositionRoot();
	const apiPromise: Promise<ClientApiV1> = root.buildAsync();
	let loading = $state(true);
	let api: ClientApiV1;

	const getApi = (): ClientApiV1 => api;

	const coordinateAppStartupAsync = async () => {
		const health = await api.Auth.Flow.checkHealthAsync();
		const hasSession = api.Auth.hasSession();

		if (!health) return;

		if (health.instanceRegistrationStatus !== "registered") {
			await goto(resolve("/auth/register"));
			return;
		}

		if (!hasSession) {
			await goto(resolve("/auth/login"));
			return;
		}
	};

	void apiPromise
		.then(async (clientApi) => {
			api = clientApi;
			await coordinateAppStartupAsync();
		})
		.finally(() => (loading = false));

	setClientApiContext(getApi);

	onMount(() => {
		void apiPromise.then(() => {
			root.playAtlasSSEClient.start();
		});
	});

	onDestroy(() => {
		void apiPromise.then(() => {
			root.playAtlasSSEClient.stop();
		});
	});
</script>

{#if loading}
	<Main class="h-dvh w-dvw flex items-center justify-center">
		<Spinner variant="primary" />
	</Main>
{:else}
	{@render children()}
{/if}
