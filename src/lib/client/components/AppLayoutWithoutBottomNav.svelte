<script lang="ts">
	import type { Snippet } from "svelte";

  let { children } : { children?: Snippet } = $props();
</script>

<div class="grid grid-cols-1 grid-rows-[3.4rem_1fr] h-dvh">
  {#if children}
    {@render children()}
  {/if}
</div>