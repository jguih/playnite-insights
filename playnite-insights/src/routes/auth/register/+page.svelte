<script lang="ts">
	import SolidButton from '$lib/client/components/buttons/SolidButton.svelte';
	import BaseInput from '$lib/client/components/forms/BaseInput.svelte';
</script>

<main class="flex h-full w-full items-center justify-center">
	<div class="block max-w-80">
		<label class="">
			<h1 class="mb-4 text-3xl">
				Registre uma senha para esta instância do
				<span class="text-primary-light-active-fg">PlayAtlas</span>
			</h1>
			<BaseInput
				class={['bg-background-1 p-2']}
				type="password"
			/>
		</label>
		<SolidButton
			class={['ml-auto mt-4 block']}
			size="lg"
		>
			Salvar
		</SolidButton>
	</div>
</main>
