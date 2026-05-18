<script lang="ts">
    import { onMount } from 'svelte'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import { albumParser } from '$lib/utils/albumParser.svelte'
    import { imageExport } from '$lib/utils/imageExport.svelte'

    import PhoneInputScreen from '$lib/components/PhoneInputScreen.svelte'
    import PhoneResultScreen from '$lib/components/PhoneResultScreen.svelte'
    import DesktopControlPanel from '$lib/components/DesktopControlPanel.svelte'
    import MobileControlPanel from '$lib/components/MobileControlPanel.svelte'

    onMount(() => {
        appSettings.init()
    })

    // Computed values
    let coverUrl = $derived(albumParser.albumData?.cover_url ?? '')

    let platformAccentColor = $derived(
        albumParser.albumData?.platform === 'AppleMusic' ? '#ff4e6b' : '#1ed760'
    )
    let resolvedAccentColor = $derived(
        appSettings.customAccentColor || platformAccentColor
    )

    let titleAlignClass = $derived(
        appSettings.titleAlign === 'center' ? 'text-center' :
            appSettings.titleAlign === 'right' ? 'text-right' : 'text-left'
    )

    let resultScreenThemeClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'bg-[#f6f7f9] text-[#101114]'
            : 'bg-surface-dim text-on-surface'
    )

    let resultOverlayClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'absolute inset-x-0 top-0 bg-gradient-to-b from-white via-white/80 to-white/20'
            : 'absolute inset-x-0 top-0 bg-gradient-to-b from-surface-dim/20 via-surface-dim/80 to-surface-dim'
    )

    let resultMetaClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'text-sm font-medium text-black/55 font-headline max-md:text-xs'
            : 'text-sm font-medium text-on-surface-variant/60 font-headline max-md:text-xs'
    )

    let trackArtistClass = $derived(
        appSettings.frameTheme === 'light' ? 'text-xs text-black/55' : 'text-xs text-on-surface-variant'
    )

    let trackDurationMutedClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'text-sm font-medium text-black/45 tabular-nums'
            : 'text-sm font-medium text-on-surface-variant/40 tabular-nums'
    )

    let trackTitleClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'text-sm font-semibold text-black overflow-hidden text-ellipsis whitespace-nowrap'
            : 'text-sm font-semibold text-white overflow-hidden text-ellipsis whitespace-nowrap'
    )

    let resultTitleClass = $derived(
        appSettings.frameTheme === 'light'
            ? 'font-headline text-3xl font-extrabold tracking-tighter text-black leading-tight max-md:text-3xl'
            : 'font-headline text-3xl font-extrabold tracking-tighter text-white leading-tight max-md:text-3xl'
    )

    // Handler functions
    async function handleSubmit() {
        await albumParser.handleSubmit(() => {
            appSettings.customAccentColor = ''
        })
    }

    function formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    function formatYear(releaseDate: string): string {
        const date = new Date(releaseDate)
        if (Number.isNaN(date.getTime())) return releaseDate.slice(0, 4) || 'Unknown'
        return String(date.getFullYear())
    }
</script>

<div
        class="relative grid h-dvh w-full place-items-center overflow-hidden {albumParser.viewState === 'input'
    ? 'bg-black'
    : 'bg-[radial-gradient(circle_at_20%_20%,rgb(255_140_147/25%),transparent_40%),radial-gradient(circle_at_80%_80%,rgb(114_254_143/18%),transparent_35%),#080808]'}"
>
    {#if albumParser.viewState === 'result' && albumParser.albumData}
        <div
                class="absolute inset-0 z-0 bg-center bg-cover transform-[scale(1.12)]"
                style="background-image: url({coverUrl}); filter: blur({appSettings.blurLevel}px)"
        ></div>
    {/if}

    {#if albumParser.viewState === 'result' && albumParser.albumData}
        <DesktopControlPanel
                locale={appSettings.locale}
                blurLevel={appSettings.blurLevel}
                exportRatio={appSettings.exportRatio}
                frameTheme={appSettings.frameTheme}
                {resolvedAccentColor}
                titleAlign={appSettings.titleAlign}
                showCredit={appSettings.showCredit}
                creditName={appSettings.creditName}
                avatarUrl={appSettings.avatarUrl}
                exporting={imageExport.exporting}
                exportError={imageExport.exportError}
                changeLocale={appSettings.changeLocale}
                openGithubRepo={appSettings.openGithubRepo}
                handleBack={albumParser.handleBack}
                updateAccentColor={appSettings.updateAccentColor}
                resetAccentColor={appSettings.resetAccentColor}
                handleAvatarUpload={appSettings.handleAvatarUpload}
                clearAvatar={appSettings.clearAvatar}
                generateAndDownloadImage={imageExport.generateAndDownloadImage}
                setBlurLevel={(v) => (appSettings.blurLevel = v)}
                setExportRatio={(v) => (appSettings.exportRatio = v)}
                setFrameTheme={(v) => (appSettings.frameTheme = v)}
                setTitleAlign={(v) => (appSettings.titleAlign = v)}
                setShowCredit={(v) => (appSettings.showCredit = v)}
                setCreditName={(v) => (appSettings.creditName = v)}
        />

        <MobileControlPanel
                isOpen={appSettings.isMobilePanelOpen}
                locale={appSettings.locale}
                blurLevel={appSettings.blurLevel}
                exportRatio={appSettings.exportRatio}
                frameTheme={appSettings.frameTheme}
                {resolvedAccentColor}
                titleAlign={appSettings.titleAlign}
                showCredit={appSettings.showCredit}
                creditName={appSettings.creditName}
                avatarUrl={appSettings.avatarUrl}
                exporting={imageExport.exporting}
                exportError={imageExport.exportError}
                changeLocale={appSettings.changeLocale}
                openGithubRepo={appSettings.openGithubRepo}
                handleBack={albumParser.handleBack}
                updateAccentColor={appSettings.updateAccentColor}
                resetAccentColor={appSettings.resetAccentColor}
                handleAvatarUpload={appSettings.handleAvatarUpload}
                clearAvatar={appSettings.clearAvatar}
                generateAndDownloadImage={imageExport.generateAndDownloadImage}
                toggleOpen={appSettings.toggleMobilePanel}
                closePanel={appSettings.closeMobilePanel}
                setBlurLevel={(v) => (appSettings.blurLevel = v)}
                setExportRatio={(v) => (appSettings.exportRatio = v)}
                setFrameTheme={(v) => (appSettings.frameTheme = v)}
                setTitleAlign={(v) => (appSettings.titleAlign = v)}
                setShowCredit={(v) => (appSettings.showCredit = v)}
                setCreditName={(v) => (appSettings.creditName = v)}
        />
    {/if}

    <div
            bind:this={imageExport.phoneFrameRef}
            class="relative z-1 w-[min(430px,100%)] aspect-9/19.5 overflow-hidden rounded-[36px] bg-transparent shadow-[0_30px_80px_rgb(0_0_0/70%)] max-md:w-[min(420px,100%-1rem)] max-md:rounded-[28px] select-none"
    >
        {#if albumParser.viewState === 'input'}
            <PhoneInputScreen
                    locale={appSettings.locale}
                    inputUrl={albumParser.inputUrl}
                    loading={albumParser.loading}
                    errorMsg={albumParser.errorMsg}
                    changeLocale={appSettings.changeLocale}
                    openGithubRepo={appSettings.openGithubRepo}
                    {handleSubmit}
                    updateInputUrl={(v) => (albumParser.inputUrl = v)}
            />
        {:else if albumParser.albumData}
            <PhoneResultScreen
                    onRootRef={(el) => (imageExport.resultScreenRef = el)}
                    albumData={albumParser.albumData}
                    {coverUrl}
                    exportRenderMode={imageExport.exportRenderMode}
                    {resultScreenThemeClass}
                    {resultOverlayClass}
                    {titleAlignClass}
                    {resultTitleClass}
                    {resolvedAccentColor}
                    {resultMetaClass}
                    {trackArtistClass}
                    {trackTitleClass}
                    {trackDurationMutedClass}
                    {formatYear}
                    {formatDuration}
            />
        {/if}
    </div>
</div>

<style>
    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2')
        format('woff2');
    }

    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff2')
        format('woff2');
    }

    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2')
        format('woff2');
    }

    @font-face {
        font-family: 'Manrope';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-700-normal.woff2')
        format('woff2');
    }

    @font-face {
        font-family: 'Manrope';
        font-style: normal;
        font-weight: 800;
        font-display: swap;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-800-normal.woff2')
        format('woff2');
    }

    @font-face {
        font-family: 'Material Symbols Outlined';
        font-style: normal;
        font-weight: 100 700;
        font-display: block;
        src: url('https://cdn.jsdelivr.net/fontsource/fonts/material-symbols-outlined:vf@latest/latin-wght-normal.woff2')
        format('woff2-variations');
    }
</style>