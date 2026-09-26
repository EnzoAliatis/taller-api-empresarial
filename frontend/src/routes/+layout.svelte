<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Gestión de empleados</title>
</svelte:head>

<main class="container">
	{@render children()}
</main>
