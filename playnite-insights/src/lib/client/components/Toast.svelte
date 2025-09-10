<script lang="ts">
	import { fly } from 'svelte/transition';
	import { dismissToast, getToasts } from '../app-state/toast.svelte.js';
</script>

<div
	class="z-1001 w-54 fixed left-0 right-0 top-[calc(var(--header-height)+2*var(--spacing))] mx-auto flex flex-col gap-1"
>
	{#each getToasts() as toast, i (toast.key)}
		<button
			in:fly={{ y: -20, duration: 200 }}
			out:fly={{ y: -20, duration: 200 }}
			class="bg-background-2 text-foreground p-2 text-left shadow"
			onclick={() => dismissToast(i)}
		>
			{#if toast.title}
				<strong>{toast.title}</strong>
			{/if}
			<p>{toast.message}</p>
		</button>
	{/each}
</div>
