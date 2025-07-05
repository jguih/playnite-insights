<script lang="ts">
	import { LayoutDashboard } from '@lucide/svelte';
	import MenuAnchor from '../MenuAnchor.svelte';

	let { selected }: { selected?: boolean } = $props();
</script>

<MenuAnchor {selected} href="/dash">
	<LayoutDashboard />
</MenuAnchor>
