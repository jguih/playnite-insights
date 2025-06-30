<script lang="ts">
	import type { Snippet } from "svelte";

  let { children, action, title } : {children?: Snippet, action?: Snippet, title?: Snippet} = $props();
</script>

<div class="bg-background-1 shadow-lg z-1000 p-4 flex flex-row items-center justify-between">
  <div class="flex flex-row items-center gap-2">
    {#if action}
      {@render action()}
    {/if}
    {#if title}
      {@render title()}
    {:else}
      <h1 class="text-md">Playnite Insights</h1>
    {/if}
  </div>
  <div>
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>