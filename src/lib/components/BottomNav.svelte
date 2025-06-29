<script lang="ts">
	import type { Snippet } from "svelte";

  let { children } : { children?: Snippet } = $props();
</script>

<div class="bg-background-1 shadow-lg z-1000 flex flex-row justify-between items-center pl-8 pr-8 pt-4 pb-4">
  {#if children}
    {@render children()}
  {/if}
</div>