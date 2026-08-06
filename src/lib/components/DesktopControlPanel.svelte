<script lang="ts">
    import { t } from '$lib/i18n/index.svelte'
    import type { Locale } from '$lib/i18n/index.svelte'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import { imageExport } from '$lib/utils/imageExport.svelte'
    import ParticleBurst from './ParticleBurst.svelte'
    import PanelControls from './PanelControls.svelte'

    const LOCALES: Locale[] = ['en', 'zh', 'ar', 'ru']
</script>

<div
        class="absolute top-6 right-6 z-60 hidden w-70 max-w-[calc(100vw-1rem)] flex-col gap-4 rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl md:flex select-none"
>
    <div class="h-8 grid grid-cols-4 gap-0 rounded-lg bg-white/10">
        {#each LOCALES as loc (loc)}
            <button
                    type="button"
                    class="rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer {appSettings.locale === loc ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => appSettings.changeLocale(loc)}
            >
                {t(`locale_${loc}`, appSettings.locale)}
            </button>
        {/each}
    </div>

    <PanelControls variant="desktop" />

    <ParticleBurst>
        <button
                type="button"
                class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                disabled={imageExport.exporting}
                data-testid="export-image-desktop"
                data-ai-action="export-image"
                onclick={imageExport.generateAndDownloadImage}
        >
            {imageExport.exporting
                ? t('label_generating', appSettings.locale)
                : t('label_generate_download', appSettings.locale)}
        </button>
    </ParticleBurst>

    {#if imageExport.exportError}
        <p class="mt-2 text-xs text-red-300">{imageExport.exportError}</p>
    {/if}
</div>
