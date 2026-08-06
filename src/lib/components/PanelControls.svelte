<script lang="ts">
    import { t } from '$lib/i18n/index.svelte'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import type { ExportRatio, FrameTheme, TextAlignMode } from '$lib/stores/appSettings.svelte'
    import { albumParser } from '$lib/utils/albumParser.svelte'
    import GithubRepoButton from './GithubRepoButton.svelte'

    let { variant }: { variant: 'desktop' | 'mobile' } = $props()

    // The desktop and mobile panels render the same controls; only these few
    // container/sizing classes differ between them.
    const STYLE = {
        desktop: {
            group: 'flex flex-col gap-4',
            ratio: 'h-8 grid grid-cols-2 gap-1 rounded-lg bg-white/10',
            theme: 'h-8 grid grid-cols-2 gap-0 rounded-lg bg-white/10',
            align: 'h-8 grid grid-cols-3 gap-0 rounded-lg bg-white/10',
            fileInput:
                'block w-[70%] h-8 text-xs text-white cursor-pointer file:cursor-pointer file:h-8 file:mr-2 file:rounded-lg file:border file:border-white/20 file:bg-white/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20',
            avatar: 'w-8 h-8 rounded-lg object-cover',
            clear: 'w-[30%] h-8 ms-auto rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed',
            showAvatarNote: true
        },
        mobile: {
            group: 'flex flex-col gap-3',
            ratio: 'h-8 grid grid-cols-2 rounded-lg bg-white/10 overflow-hidden',
            theme: 'h-8 grid grid-cols-2 rounded-lg bg-white/10 overflow-hidden',
            align: 'h-8 grid grid-cols-3 rounded-lg bg-white/10 overflow-hidden',
            fileInput:
                'block w-[80%] text-xs text-white cursor-pointer file:cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-white/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20',
            avatar: 'w-8 h-8 rounded-full object-cover',
            clear: 'flex-1 h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed',
            showAvatarNote: false
        }
    } as const

    const s = $derived(STYLE[variant])
</script>

{#snippet heading(text: string)}
    <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">{text}</div>
{/snippet}

{#snippet segmented(
    containerClass: string,
    options: { value: string; label: string }[],
    selected: string,
    onSelect: (value: string) => void
)}
    <div class={containerClass}>
        {#each options as option (option.value)}
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors cursor-pointer {selected === option.value ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => onSelect(option.value)}
            >
                {option.label}
            </button>
        {/each}
    </div>
{/snippet}

<GithubRepoButton
        onClick={appSettings.openGithubRepo}
        testId="open-github-{variant}"
        className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
        iconClassName="h-4 w-4"
/>

<button
        type="button"
        class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 cursor-pointer"
        onclick={albumParser.handleBack}
>
    {t('label_back', appSettings.locale)}
</button>

<div>
    {@render heading(t('label_blur', appSettings.locale))}
    <input
            class="w-full cursor-pointer"
            type="range"
            name="blur-level-{variant}"
            aria-label={t('label_blur', appSettings.locale)}
            min="0"
            max="40"
            step="1"
            value={appSettings.blurLevel}
            oninput={(event) => (appSettings.blurLevel = Number(event.currentTarget.value || 0))}
    />
</div>

<div>
    {@render heading(t('label_export_ratio', appSettings.locale))}
    {@render segmented(
        s.ratio,
        [
            { value: '3:4', label: '3:4' },
            { value: '9:16', label: '9:16' }
        ],
        appSettings.exportRatio,
        (value) => (appSettings.exportRatio = value as ExportRatio)
    )}
</div>

<div>
    {@render heading(t('label_frame_theme', appSettings.locale))}
    {@render segmented(
        s.theme,
        [
            { value: 'dark', label: t('label_theme_dark', appSettings.locale) },
            { value: 'light', label: t('label_theme_light', appSettings.locale) }
        ],
        appSettings.frameTheme,
        (value) => (appSettings.frameTheme = value as FrameTheme)
    )}
</div>

<div class={s.group}>
    <div>
        {@render heading(t('label_accent_color', appSettings.locale))}
        <div class="flex items-center gap-2">
            <input
                    class="h-8 w-14 cursor-pointer rounded-lg border border-white/25 bg-transparent p-1"
                    type="color"
                    name="accent-color-{variant}"
                    aria-label={t('label_accent_color', appSettings.locale)}
                    value={appSettings.accentColor}
                    oninput={appSettings.updateAccentColor}
            />
            <button
                    type="button"
                    class="flex-1 h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 cursor-pointer"
                    onclick={appSettings.resetAccentColor}
            >
                {t('label_reset_default', appSettings.locale)}
            </button>
        </div>
    </div>

    {@render heading(t('label_text_align', appSettings.locale))}
    {@render segmented(
        s.align,
        [
            { value: 'left', label: t('label_align_left', appSettings.locale) },
            { value: 'center', label: t('label_align_center', appSettings.locale) },
            { value: 'right', label: t('label_align_right', appSettings.locale) }
        ],
        appSettings.titleAlign,
        (value) => (appSettings.titleAlign = value as TextAlignMode)
    )}

    <div>
        <label
                class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-white/75 cursor-pointer"
        >
            <span>{t('label_render_credit', appSettings.locale)}</span>
            <input
                    class="h-4 w-4 cursor-pointer accent-white"
                    type="checkbox"
                    checked={appSettings.showCredit}
                    onchange={(event) => (appSettings.showCredit = event.currentTarget.checked)}
            />
        </label>
    </div>

    {#if appSettings.showCredit}
        <div>
            {@render heading(t('label_credit', appSettings.locale))}
            <input
                    class="w-full h-8 rounded-lg border border-white/20 bg-black/35 px-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    type="text"
                    name="credit-name-{variant}"
                    autocomplete="off"
                    maxlength="36"
                    placeholder="@your_name"
                    value={appSettings.creditName}
                    oninput={(event) => (appSettings.creditName = event.currentTarget.value)}
            />
        </div>

        <div>
            {@render heading(t('label_avatar', appSettings.locale))}
            <div class="flex items-center gap-2">
                {#if appSettings.avatarUrl}
                    <img
                            class={s.avatar}
                            src={appSettings.avatarUrl}
                            alt=""
                            width="32"
                            height="32"
                    />
                {:else}
                    <input
                            id="avatar-upload-{variant}"
                            class={s.fileInput}
                            type="file"
                            name="avatar-upload-{variant}"
                            accept="image/*"
                            aria-label={t('label_avatar', appSettings.locale)}
                            data-testid="avatar-upload-{variant}"
                            data-ai-action="upload-avatar"
                            onchange={appSettings.handleAvatarUpload}
                    />
                {/if}
                <button
                        type="button"
                        class={s.clear}
                        disabled={!appSettings.avatarUrl}
                        data-testid="clear-avatar-{variant}"
                        data-ai-action="clear-avatar"
                        onclick={appSettings.clearAvatar}
                >
                    {t('label_clear', appSettings.locale)}
                </button>
            </div>
            {#if s.showAvatarNote && appSettings.avatarUrl}
                <p class="mt-1 text-[11px] font-medium text-white/55">
                    {t('label_avatar_cached', appSettings.locale)}
                </p>
            {/if}
        </div>
    {/if}
</div>
