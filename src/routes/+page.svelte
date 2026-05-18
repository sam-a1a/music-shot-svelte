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

    $effect(() => {
        appSettings.handleViewStateChange(albumParser.viewState)
    })

    const resolvedAccentColor = $derived(
        appSettings.customAccentColor || (appSettings.frameTheme === 'dark' ? '#ffffff' : '#000000')
    )

    function formatYear(releaseDate: string): string {
        if (!releaseDate) return ''
        return new Date(releaseDate).getFullYear().toString()
    }

    function formatDuration(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }
</script>

<div class="relative h-screen w-screen overflow-hidden bg-black font-sans">
    {#if albumParser.viewState === 'input'}
        <PhoneInputScreen
                locale={appSettings.locale}
                inputUrl={albumParser.inputUrl}
                loading={albumParser.loading}
                errorMsg={albumParser.errorMsg}
                changeLocale={appSettings.changeLocale}
                openGithubRepo={appSettings.openGithubRepo}
                handleSubmit={() => albumParser.handleSubmit()}
                updateInputUrl={(v) => (albumParser.inputUrl = v)}
        />
    {:else}
        <div class="relative mx-auto h-full max-w-[430px]">
            <div
                    bind:this={imageExport.phoneFrameRef}
                    class="relative h-full w-full overflow-hidden rounded-[2.5rem] border-[3px] border-white/10 bg-black shadow-[0_0_60px_rgba(0,0,0,0.6)]"
            >
                <PhoneResultScreen
                        bind:this={imageExport.resultScreenRef}
                        albumData={albumParser.albumData}
                        coverUrl={albumParser.albumData?.cover_url || ''}
                        exportRenderMode={imageExport.exportRenderMode}
                        resultScreenThemeClass={appSettings.frameTheme === 'dark' ? 'text-white' : 'text-black'}
                        resultOverlayClass={appSettings.frameTheme === 'dark' ? 'bg-black/50' : 'bg-white/50'}
                        titleAlignClass={appSettings.titleAlign === 'left' ? 'text-left' : appSettings.titleAlign === 'right' ? 'text-right' : 'text-center'}
                        resultTitleClass="text-3xl font-extrabold"
                        resolvedAccentColor={resolvedAccentColor}
                        resultMetaClass="text-sm text-white/60"
                        trackArtistClass="text-sm text-white/50"
                        trackTitleClass="text-sm font-semibold"
                        trackDurationMutedClass="text-sm text-white/40"
                        formatYear={formatYear}
                        formatDuration={formatDuration}
                />
            </div>
        </div>

        <DesktopControlPanel
                locale={appSettings.locale}
                blurLevel={appSettings.blurLevel}
                exportRatio={appSettings.exportRatio}
                frameTheme={appSettings.frameTheme}
                resolvedAccentColor={resolvedAccentColor}
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
                resolvedAccentColor={resolvedAccentColor}
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
</div>