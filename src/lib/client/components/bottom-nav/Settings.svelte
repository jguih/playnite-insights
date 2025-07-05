<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import MenuAnchor from '../MenuAnchor.svelte';

	let { selected }: { selected?: boolean } = $props();
</script>

<MenuAnchor {selected}>
	<Settings />
</MenuAnchor>
