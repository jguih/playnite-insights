<script lang="ts">
	import { Home } from '@lucide/svelte';
	import MenuAnchor from '../MenuAnchor.svelte';

	let { selected }: { selected?: boolean } = $props();
</script>

<MenuAnchor {selected} href="/">
	<Home />
</MenuAnchor>
