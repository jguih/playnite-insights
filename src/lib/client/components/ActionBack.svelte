<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import MenuButton from './MenuButton.svelte';
</script>

<MenuButton onclick={() => history.back()}>
	<ArrowLeft />
</MenuButton>
