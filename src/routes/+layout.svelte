<script lang="ts">
    import './layout.css';
    import { appSettings } from '$lib/stores/appSettings.svelte';

    let { children } = $props();

    // Arabic reads right-to-left, so the document direction follows the locale.
    // The result screen opts back into LTR so the exported image is locale-independent.
    $effect(() => {
        document.documentElement.lang = appSettings.locale;
        document.documentElement.dir = appSettings.dir;
    });
</script>

<svelte:head>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>" />
    <title>Music Cover</title>
</svelte:head>

{@render children()}
