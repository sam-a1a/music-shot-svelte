<script lang="ts">
    import GithubRepoButton from './GithubRepoButton.svelte'
    import ParticleBurst from './ParticleBurst.svelte'

    type ExportRatio = '3:4' | '9:16'
    type FrameTheme = 'dark' | 'light'
    type TextAlignMode = 'left' | 'center' | 'right'

    let {
        locale,
        blurLevel,
        exportRatio,
        frameTheme,
        resolvedAccentColor,
        titleAlign,
        showCredit,
        creditName,
        avatarUrl,
        exporting,
        exportError,
        changeLocale,
        openGithubRepo,
        handleBack,
        updateAccentColor,
        resetAccentColor,
        handleAvatarUpload,
        clearAvatar,
        generateAndDownloadImage,
        setBlurLevel,
        setExportRatio,
        setFrameTheme,
        setTitleAlign,
        setShowCredit,
        setCreditName,
    }: {
        locale: 'en' | 'zh'
        blurLevel: number
        exportRatio: ExportRatio
        frameTheme: FrameTheme
        resolvedAccentColor: string
        titleAlign: TextAlignMode
        showCredit: boolean
        creditName: string
        avatarUrl: string
        exporting: boolean
        exportError: string
        changeLocale: (next: 'en' | 'zh') => void
        openGithubRepo: () => void
        handleBack: () => void
        updateAccentColor: (event: Event) => void
        resetAccentColor: () => void
        handleAvatarUpload: (event: Event) => void
        clearAvatar: () => void
        generateAndDownloadImage: () => void
        setBlurLevel: (value: number) => void
        setExportRatio: (value: ExportRatio) => void
        setFrameTheme: (value: FrameTheme) => void
        setTitleAlign: (value: TextAlignMode) => void
        setShowCredit: (value: boolean) => void
        setCreditName: (value: string) => void
    } = $props()

    function onBlurInput(event: Event) {
        setBlurLevel(Number((event.target as HTMLInputElement).value || 0))
    }
    function onCreditNameInput(event: Event) {
        setCreditName((event.target as HTMLInputElement).value)
    }
    function onShowCreditChange(event: Event) {
        setShowCredit((event.target as HTMLInputElement).checked)
    }
</script>

<div
        class="absolute top-6 right-6 z-60 hidden w-70 max-w-[calc(100vw-1rem)] flex-col gap-4 rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl md:flex select-none"
>
    <div class="h-8 grid grid-cols-2 gap-0 rounded-lg bg-white/10">
        <button
                type="button"
                class="h-8 rounded-lg text-xs font-semibold text-white transition-colors {locale === 'zh' ? 'bg-white/25' : 'hover:bg-white/15'}"
                data-testid="locale-zh-desktop"
                data-ai-action="set-locale-zh"
                onclick={() => changeLocale('zh')}
        >
            中文
        </button>
        <button
                type="button"
                class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {locale === 'en' ? 'bg-white/25' : 'hover:bg-white/15'}"
                data-testid="locale-en-desktop"
                data-ai-action="set-locale-en"
                onclick={() => changeLocale('en')}
        >
            EN
        </button>
    </div>

    <GithubRepoButton
            onClick={openGithubRepo}
            testId="open-github-desktop"
            className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            iconClassName="h-4 w-4"
    />

    <button
            type="button"
            class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            onclick={handleBack}
    >
        Back
    </button>

    <div>
        <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
            Blur
        </div>
        <input
                class="w-full"
                type="range"
                name="blur-level-desktop"
                aria-label="Blur"
                min="0"
                max="40"
                step="1"
                value={blurLevel}
                oninput={onBlurInput}
        />
    </div>

    <div>
        <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
            Export Ratio
        </div>
        <div class="h-8 grid grid-cols-2 gap-1 rounded-lg bg-white/10">
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {exportRatio === '3:4' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setExportRatio('3:4')}
            >
                3:4
            </button>
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {exportRatio === '9:16' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setExportRatio('9:16')}
            >
                9:16
            </button>
        </div>
    </div>

    <div>
        <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
            Frame Theme
        </div>
        <div class="h-8 grid grid-cols-2 gap-0 rounded-lg bg-white/10">
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {frameTheme === 'dark' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setFrameTheme('dark')}
            >
                Dark
            </button>
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {frameTheme === 'light' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setFrameTheme('light')}
            >
                Light
            </button>
        </div>
    </div>

    <div class="flex flex-col gap-4">
        <div>
            <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                Accent Color
            </div>
            <div class="flex items-center gap-2">
                <input
                        class="h-8 w-14 cursor-pointer rounded-lg border border-white/25 bg-transparent p-1"
                        type="color"
                        name="accent-color-desktop"
                        aria-label="Accent Color"
                        value={resolvedAccentColor}
                        oninput={updateAccentColor}
                />
                <button
                        type="button"
                        class="flex-1 rounded-lg border border-white/20 bg-white/10 h-8 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                        onclick={resetAccentColor}
                >
                    Reset Default
                </button>
            </div>
        </div>

        <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
            Text Align
        </div>
        <div class="h-8 grid grid-cols-3 gap-0 rounded-lg bg-white/10">
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {titleAlign === 'left' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setTitleAlign('left')}
            >
                Left
            </button>
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {titleAlign === 'center' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setTitleAlign('center')}
            >
                Center
            </button>
            <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {titleAlign === 'right' ? 'bg-white/25' : 'hover:bg-white/15'}"
                    onclick={() => setTitleAlign('right')}
            >
                Right
            </button>
        </div>

        <div>
            <label
                    class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-white/75"
            >
                <span>Render Credit</span>
                <input
                        class="h-4 w-4 cursor-pointer accent-white"
                        type="checkbox"
                        checked={showCredit}
                        onchange={onShowCreditChange}
                />
            </label>
        </div>

        {#if showCredit}
            <div>
                <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                    Credit
                </div>
                <input
                        class="w-full h-8 rounded-lg border border-white/20 bg-black/35 px-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        type="text"
                        name="credit-name-desktop"
                        autocomplete="off"
                        maxlength="36"
                        placeholder="@your_name"
                        value={creditName}
                        oninput={onCreditNameInput}
                />
            </div>
        {/if}

        {#if showCredit}
            <div>
                <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                    Avatar
                </div>
                <div class="flex items-center gap-2">
                    {#if !avatarUrl}
                        <input
                                id="avatar-upload-desktop"
                                class="block w-[70%] h-8 text-xs text-white cursor-pointer file:cursor-pointer file:h-8 file:mr-2 file:rounded-lg file:border file:border-white/20 file:bg-white/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                                type="file"
                                name="avatar-upload-desktop"
                                accept="image/*"
                                aria-label="Avatar"
                                data-testid="avatar-upload-desktop"
                                data-ai-action="upload-avatar"
                                onchange={handleAvatarUpload}
                        />
                    {/if}
                    {#if avatarUrl}
                        <img
                                src={avatarUrl}
                                alt=""
                                width="32"
                                height="32"
                                class="w-8 h-8 rounded-lg object-cover"
                        />
                    {/if}
                    <button
                            type="button"
                            class="w-[30%] h-8 ml-auto rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                            disabled={!avatarUrl}
                            data-testid="clear-avatar-desktop"
                            data-ai-action="clear-avatar"
                            onclick={clearAvatar}
                    >
                        Clear
                    </button>
                </div>
                {#if avatarUrl}
                    <p class="mt-1 text-[11px] font-medium text-white/55">
                        Avatar loaded from cache
                    </p>
                {/if}
            </div>
        {/if}
    </div>

    <ParticleBurst>
        <button
                type="button"
                class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={exporting}
                data-testid="export-image-desktop"
                data-ai-action="export-image"
                onclick={generateAndDownloadImage}
        >
            {exporting ? 'Generating...' : 'Generate & Download'}
        </button>
    </ParticleBurst>

    {#if exportError}
        <p class="mt-2 text-xs text-red-300">{exportError}</p>
    {/if}
</div>