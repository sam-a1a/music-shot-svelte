<script lang="ts">
    import { t } from '$lib/i18n/index.svelte'
    import type { Locale } from '$lib/i18n/index.svelte'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import { imageExport } from '$lib/utils/imageExport.svelte'
    import PanelControls from './PanelControls.svelte'

    const LOCALES: Locale[] = ['en', 'zh', 'ar', 'ru']
</script>

<button
        type="button"
        class="fixed inset-x-3 bottom-3 z-68 flex h-12 items-center justify-center rounded-xl border border-white/20 bg-black/65 px-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-black/75 md:hidden cursor-pointer {appSettings.isMobilePanelOpen
            ? 'opacity-0 pointer-events-none'
            : ''}"
        onclick={appSettings.toggleMobilePanel}
>
    {t('label_edit_export', appSettings.locale)}
</button>

{#if appSettings.isMobilePanelOpen}
    <button
            class="fixed inset-0 z-69 bg-black/55 md:hidden cursor-pointer"
            onclick={appSettings.closeMobilePanel}
            aria-label={t('label_close', appSettings.locale)}
    ></button>

    <div
            class="fixed inset-x-0 bottom-0 z-70 overflow-hidden rounded-t-2xl border-t border-white/15 bg-black/78 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-xl md:hidden"
    >
        <div class="mb-3 flex items-center justify-between gap-2">
            <button
                    type="button"
                    class="flex h-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20 cursor-pointer"
                    onclick={appSettings.closeMobilePanel}
            >
                {t('label_close', appSettings.locale)}
            </button>
            <div class="grid grid-cols-4 rounded-lg bg-white/10">
                {#each LOCALES as loc (loc)}
                    <button
                            type="button"
                            class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors cursor-pointer {appSettings.locale === loc ? 'bg-white/25' : 'hover:bg-white/15'}"
                            onclick={() => appSettings.changeLocale(loc)}
                    >
                        {t(`locale_${loc}`, appSettings.locale)}
                    </button>
                {/each}
            </div>
        </div>

        <div class="max-h-[calc(78dvh-3.75rem)] overflow-y-auto pr-1 flex flex-col gap-3">
            <PanelControls variant="mobile" />

            <button
                    type="button"
                    class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    disabled={imageExport.exporting}
                    data-testid="export-image-mobile"
                    data-ai-action="export-image"
                    onclick={imageExport.generateAndDownloadImage}
            >
                {imageExport.exporting
                    ? t('label_generating', appSettings.locale)
                    : t('label_generate_download', appSettings.locale)}
            </button>

            {#if imageExport.exportError}
                <p class="mt-2 text-xs text-red-300">{imageExport.exportError}</p>
            {/if}
        </div>
    </div>
{/if}
