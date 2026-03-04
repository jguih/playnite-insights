<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import type { AuthFlowLoginResult } from "$lib/modules/auth/application";
	import { getClientApiContext } from "$lib/modules/bootstrap/application/client-api.context";
	import { m } from "$lib/paraglide/messages";
	import SolidButton from "$lib/ui/components/buttons/SolidButton.svelte";
	import Input from "$lib/ui/components/forms/Input.svelte";
	import Main from "$lib/ui/components/Main.svelte";
	import type { EventHandler } from "svelte/elements";

	const api = getClientApiContext();
	const loginState = $state<{
		loading: boolean;
		result: AuthFlowLoginResult | null;
		password: string;
	}>({
		loading: false,
		result: null,
		password: "",
	});

	const loginAsync = async () => {
		try {
			loginState.loading = true;
			loginState.result = null;

			const result = await api().Auth.Flow.loginAsync({ password: loginState.password });

			loginState.result = result;

			if (result.success) await goto(resolve("/"));
		} finally {
			loginState.loading = false;
		}
	};

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
		event.preventDefault();
		if (loginState.loading) return;
		await loginAsync();
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
			{m["login_page.title.prefix"]()}
			<span class="text-primary-light-active-fg">
				{m["product_name"]()}
			</span>
			{m["login_page.title.suffix"]()}
		</label>
		<Input
			placeholder={m["login_page.placeholder_instance_password"]()}
			id="instance-password"
			type="password"
			variant={loginState.result?.success === false ? "error" : "primary"}
			required
			autofocus
			enterkeyhint="done"
			autocomplete="current-password"
			oninput={() => (loginState.result = null)}
			bind:value={loginState.password}
		/>
		{#if loginState.result && !loginState.result.success}
			<p class="text-sm text-error-light-fg">
				{loginState.result.reason_code === "instance_not_registered"
					? m["login_page.validation.instance_not_registered"]()
					: m["login_page.error_generic"]()}
			</p>
		{/if}
		<SolidButton
			class="self-end w-fit block"
			type="submit"
			disabled={loginState.loading || !loginState.password}
			state={loginState.loading ? "loading" : !loginState.password ? "disabled" : "default"}
		>
			{m["login_page.login_label"]()}
		</SolidButton>
	</form>
</Main>
