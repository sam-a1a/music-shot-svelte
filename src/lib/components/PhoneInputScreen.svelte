<script lang="ts">
    import { slide } from 'svelte/transition'
    import { t } from '$lib/i18n/index.svelte'
    import type { Locale } from '$lib/i18n/index.svelte'
    import GithubRepoButton from './GithubRepoButton.svelte'

    let {
        locale,
        inputUrl,
        loading,
        errorMsg,
        changeLocale,
        openGithubRepo,
        handleSubmit,
        updateInputUrl,
    }: {
        locale: Locale
        inputUrl: string
        loading: boolean
        errorMsg: string
        changeLocale: (next: Locale) => void
        openGithubRepo: () => void
        handleSubmit: () => void
        updateInputUrl: (value: string) => void
    } = $props()

    function onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value
        updateInputUrl(value)
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && inputUrl.trim()) {
            event.preventDefault()
            handleSubmit()
        }
    }
</script>

<div class="relative grid h-full w-full place-items-center overflow-hidden p-4 max-md:p-3">
    <div
            class="relative w-full rounded-3xl border border-white/15 bg-[linear-gradient(180deg,rgb(255_255_255/10%),rgb(255_255_255/4%))] p-6 shadow-[0_16px_50px_rgb(0_0_0/45%)] backdrop-blur-xl max-md:rounded-[20px] max-md:p-5"
    >
        <div class="mb-2 flex items-center justify-between gap-1">
            <GithubRepoButton
                    onClick={openGithubRepo}
                    testId="open-github-input"
                    className="h-6 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
                    iconClassName="h-3.5 w-3.5"
            />
            <div class="grid grid-cols-4 rounded-lg bg-white/10">
                {#each (['en', 'zh', 'ar', 'ru'] as Locale[]) as loc (loc)}
                    <button
                            type="button"
                            class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors cursor-pointer {locale === loc ? 'bg-white/25' : 'hover:bg-white/15'}"
                            onclick={() => changeLocale(loc)}
                    >
                        {t(`locale_${loc}`, locale)}
                    </button>
                {/each}
            </div>
        </div>

        <div class="mb-6 pb-5 max-md:mb-5 max-md:pb-4">
            <h1
                    class="m-0 mt-2 font-headline text-[34px] leading-[1.02] font-extrabold text-white max-md:text-[28px]"
            >
                {t('app_title', locale)}
            </h1>
            <p class="m-0 mt-2 text-[13px] leading-5 text-white/80 max-md:text-xs">
                {t('input_subtitle', locale)}
            </p>
        </div>

        <div>
            <label class="sr-only" for="album-url">Album URL</label>
            <input
                    id="album-url"
                    value={inputUrl}
                    class="h-12 w-full rounded-2xl border border-white/22 bg-black/35 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors placeholder:text-white/45 max-md:h-11"
                    type="url"
                    name="album-url"
                    autocomplete="off"
                    placeholder={t('input_placeholder', locale)}
                    disabled={loading}
                    aria-invalid={!!errorMsg || undefined}
                    aria-describedby={errorMsg ? 'album-url-error' : undefined}
                    data-testid="album-url-input"
                    data-ai-action="input-album-url"
                    oninput={onInput}
                    onkeydown={handleKeydown}
            />

            {#if errorMsg}
                <p
                        id="album-url-error"
                        role="alert"
                        transition:slide={{ duration: 250 }}
                        class="mt-2 rounded-lg border border-red-500/45 bg-red-500/10 px-2.5 py-1.5 text-[12px] font-medium text-red-300"
                >
                    {errorMsg}
                </p>
            {/if}

            <div class="relative mt-3 group">
                <button
                        class="h-12 w-full rounded-2xl bg-white font-headline text-[15px] font-extrabold tracking-[0.02em] text-[#041017] transition-all duration-300 ease-in-out active:scale-[0.995] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/40 disabled:text-white/60"
                        type="button"
                        disabled={loading || !inputUrl.trim()}
                        data-testid="parse-album-url"
                        data-ai-action="parse-album-url"
                        onclick={handleSubmit}
                >
                    {loading ? t('input_parsing', locale) : t('input_submit', locale)}
                </button>
                {#if !inputUrl.trim() && !loading}
                    <div class="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none shadow-lg">
                        {t('error_empty_url', locale)}
                    </div>
                {/if}
            </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-2 pt-5 max-md:mt-4 max-md:pt-4">
      <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
        {t('label_supported_platforms', locale)}
      </span>
            <span
                    class="inline-flex items-center rounded-full bg-[#1ed760] px-2.5 py-1 text-[11px] font-semibold text-white"
            >
        Spotify
      </span>
            <span
                    class="inline-flex items-center rounded-full bg-[#ff4e6b] px-2.5 py-1 text-[11px] font-semibold text-white"
            >
        Apple Music
      </span>
        </div>
    </div>
</div>