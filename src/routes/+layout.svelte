<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	$inspect(data);
	let appName = $derived(data.appName);
</script>

<svelte:head>
	<title>{appName}</title>
	<meta name="application-name" content={appName} />
	<meta name="apple-mobile-web-app-title" content={appName} />
</svelte:head>

{@render children()}
