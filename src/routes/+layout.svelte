<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.ico';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Hot &amp; Cold</title>
</svelte:head>

{@render children()}
