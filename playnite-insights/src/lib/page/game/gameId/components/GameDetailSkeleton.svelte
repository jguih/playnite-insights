<script lang="ts">
</script>

<div class="relative">
	<div class="h-[50dvh] w-full bg-black/10 animate-pulse"></div>
	<div class="absolute left-0 px-6 bottom-12 translate-y-1/2 flex gap-4 items-end">
		<div class="min-w-40 max-w-40 aspect-2/3 bg-black/20 rounded animate-pulse"></div>
		<div class="pb-2 space-y-2">
			<div class="h-6 w-64 bg-black/20 rounded animate-pulse"></div>
			<div class="h-4 w-40 bg-black/15 rounded animate-pulse"></div>
		</div>
	</div>
</div>

<div class="px-6 pt-24 pb-6 flex flex-col gap-6">
	{#each Array.from({ length: 4 }, () => crypto.randomUUID()) as id (id)}
		<div class="space-y-2">
			<div class="h-4 w-32 bg-black/20 rounded animate-pulse"></div>
			<div class="h-3 w-full bg-black/10 rounded animate-pulse"></div>
			<div class="h-3 w-3/4 bg-black/10 rounded animate-pulse"></div>
		</div>
	{/each}
</div>
