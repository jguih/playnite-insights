<script lang="ts">
	import AppLayout from '$lib/components/AppLayout.svelte';
	import Header from '$lib/components/Header.svelte';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let { children } : { children: Snippet }= $props();
</script>

{@render children()}
