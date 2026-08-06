<script lang="ts">
    import { onMount } from 'svelte'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import { albumParser } from '$lib/utils/albumParser.svelte'
    import { imageExport } from '$lib/utils/imageExport.svelte'

    import PhoneInputScreen from '$lib/components/PhoneInputScreen.svelte'
    import PhoneResultScreen from '$lib/components/PhoneResultScreen.svelte'
    import DesktopControlPanel from '$lib/components/DesktopControlPanel.svelte'
    import MobileControlPanel from '$lib/components/MobileControlPanel.svelte'

    onMount(appSettings.init)

    let album = $derived(albumParser.viewState === 'result' ? albumParser.albumData : null)
</script>

<div
        class="relative grid h-dvh w-full place-items-center overflow-hidden {albumParser.viewState === 'input'
    ? 'bg-black'
    : 'bg-[radial-gradient(circle_at_20%_20%,rgb(255_140_147/25%),transparent_40%),radial-gradient(circle_at_80%_80%,rgb(114_254_143/18%),transparent_35%),#080808]'}"
>
    {#if album}
        <div
                class="absolute inset-0 z-0 bg-center bg-cover transform-[scale(1.12)]"
                style="background-image: url({album.cover_url}); filter: blur({appSettings.blurLevel}px)"
        ></div>

        <DesktopControlPanel />
        <MobileControlPanel />
    {/if}

    <div
            bind:this={imageExport.phoneFrameRef}
            class="relative z-1 w-[min(430px,100%)] aspect-9/19.5 overflow-hidden rounded-[36px] bg-transparent shadow-[0_30px_80px_rgb(0_0_0/70%)] max-md:w-[min(420px,100%-1rem)] max-md:rounded-[28px] select-none"
    >
        {#if album}
            <PhoneResultScreen albumData={album} />
        {:else}
            <PhoneInputScreen />
        {/if}
    </div>
</div>
