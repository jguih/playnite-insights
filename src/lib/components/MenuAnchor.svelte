<script lang="ts">
	import type { Snippet } from "svelte";

  let { children } : { children?: Snippet } = $props();
</script>

<a class="button hover:text-primary-500 p-2 border-2 border-solid border-transparent hover:border-primary-500 active:border-primary-500 focus:border-primary-500 outline-0" href="/">
  {#if children}
    {@render children()}
  {/if}
</a>