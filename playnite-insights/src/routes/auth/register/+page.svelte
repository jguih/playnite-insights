<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import type { AuthFlowRegisterResult } from "$lib/modules/auth/application";
	import { getClientApiContext } from "$lib/modules/bootstrap/application/client-api.context";
	import { m } from "$lib/paraglide/messages";
	import SolidButton from "$lib/ui/components/buttons/SolidButton.svelte";
	import Input from "$lib/ui/components/forms/Input.svelte";
	import Main from "$lib/ui/components/Main.svelte";
	import type { EventHandler } from "svelte/elements";

	const api = getClientApiContext();
	const registerState = $state<{
		loading: boolean;
		result: AuthFlowRegisterResult | null;
		password: string;
	}>({
		loading: false,
		result: null,
		password: "",
	});

	const registerAsync = async () => {
		try {
			registerState.loading = true;
			registerState.result = null;

			const result = await api().Auth.Flow.registerAsync({ password: registerState.password });

			registerState.result = result;

			if (result.success) await goto(resolve("/auth/login"));
		} finally {
			registerState.loading = false;
		}
	};

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
		event.preventDefault();
		if (registerState.loading) return;
		await registerAsync();
	};
</script>

<Main class="h-dvh w-dvw flex items-center justify-center">
	<form
		class="flex flex-col gap-4 w-64"
		onsubmit={handleSubmit}
	>
		<label
			class="text-heading-1"
			for="instance-password"
		>
			{m["register_page.title.prefix"]()}
			<span class="text-primary-light-active-fg">
				{m["product_name"]()}
			</span>
			{m["register_page.title.suffix"]()}
		</label>
		<Input
			placeholder={m["register_page.placeholder_instance_password"]()}
			id="instance-password"
			type="password"
			variant={registerState.result?.success === false ? "error" : "primary"}
			required
			autofocus
			enterkeyhint="done"
			autocomplete="current-password"
			oninput={() => (registerState.result = null)}
			bind:value={registerState.password}
		/>
		{#if registerState.result && !registerState.result.success}
			<p class="text-sm text-error-light-fg">
				{#if registerState.result.reason_code === "instance_already_registered"}
					{m["register_page.error_instance_already_registered"]()}
				{:else}
					{m["register_page.error_generic"]()}
				{/if}
			</p>
		{/if}
		<SolidButton
			class="self-end w-fit block"
			type="submit"
			disabled={registerState.loading || !registerState.password}
			state={registerState.loading ? "loading" : !registerState.password ? "disabled" : "default"}
		>
			{m["register_page.register_label"]()}
		</SolidButton>
	</form>
</Main>
