<script lang="ts">
	import { fly } from 'svelte/transition';
	import { dismissToast, getToasts } from '../app-state/toast.svelte.js';
</script>

<div
	class="fixed left-0 right-0 top-[calc(var(--header-height)+2*var(--spacing))] z-40 mx-auto flex w-64 flex-col gap-1 shadow"
>
	{#each getToasts() as toast, i (toast.key)}
		<button
			in:fly={{ y: -20, duration: 200 }}
			out:fly={{ y: -20, duration: 200 }}
			class={[
				'p-2 text-left',
				toast.type === 'info' && 'bg-background-1 text-foreground',
				toast.type === 'success' && 'text-success-fg bg-success-bg',
				toast.type === 'error' && 'text-error-fg bg-error-bg',
				toast.type === 'warning' && 'text-warning-fg bg-warning-bg',
			]}
			onclick={() => dismissToast(i)}
		>
			{#if toast.title}
				<strong>{toast.title}</strong>
			{/if}
			<p>{toast.message}</p>
		</button>
	{/each}
</div>
