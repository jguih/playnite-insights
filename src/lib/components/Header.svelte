<script lang="ts">
	import { ArrowLeft, Menu } from "@lucide/svelte";
	import type { Snippet } from "svelte";
	import MenuAnchor from "./MenuAnchor.svelte";

  let { children, action } : {children?: Snippet, action?: Snippet} = $props();
</script>

<div class="bg-background-1 shadow-lg z-1000 p-4 flex flex-row items-center justify-between">
  <div class="flex flex-row items-center gap-2">
    {#if action}
      {@render action()}
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
  <div></div>
</div>