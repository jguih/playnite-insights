<script lang="ts">
	import type { Snippet } from "svelte";

  let { children } : {children?: Snippet } = $props();
</script>

<main class="p-4 overscroll-contain overflow-y-scroll">
  {#if children}
    {@render children()}
  {/if}
</main>