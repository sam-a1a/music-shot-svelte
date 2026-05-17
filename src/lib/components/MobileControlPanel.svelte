<script lang="ts">
    import GithubRepoButton from './GithubRepoButton.svelte'

    type ExportRatio = '3:4' | '9:16'
    type FrameTheme = 'dark' | 'light'
    type TextAlignMode = 'left' | 'center' | 'right'

    let {
        isOpen,
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
        toggleOpen,
        closePanel,
        setBlurLevel,
        setExportRatio,
        setFrameTheme,
        setTitleAlign,
        setShowCredit,
        setCreditName,
    }: {
        isOpen: boolean
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
        toggleOpen: () => void
        closePanel: () => void
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

{#if isOpen}
    <button
            type="button"
            class="fixed inset-x-3 bottom-3 z-68 flex h-12 items-center justify-center rounded-xl border border-white/20 bg-black/65 px-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-black/75 md:hidden opacity-0 pointer-events-none"
    >
        Edit & Export
    </button>
{:else}
    <button
            type="button"
            class="fixed inset-x-3 bottom-3 z-68 flex h-12 items-center justify-center rounded-xl border border-white/20 bg-black/65 px-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-black/75 md:hidden"
            onclick={toggleOpen}
    >
        Edit & Export
    </button>
{/if}

{#if isOpen}
    <button
            class="fixed inset-0 z-69 bg-black/55 md:hidden"
            onclick={closePanel}
            aria-label="Close panel backdrop"
    ></button>
{/if}

{#if isOpen}
    <div
            class="fixed inset-x-0 bottom-0 z-70 overflow-hidden rounded-t-2xl border-t border-white/15 bg-black/78 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-xl md:hidden"
    >
        <div class="mb-3 flex items-center justify-between gap-2">
            <button
                    type="button"
                    class="flex h-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                    onclick={closePanel}
            >
                Close
            </button>
            <div class="grid grid-cols-2 rounded-lg bg-white/10">
                <button
                        type="button"
                        class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {locale === 'zh' ? 'bg-white/25' : 'hover:bg-white/15'}"
                        data-testid="locale-zh-mobile"
                        data-ai-action="set-locale-zh"
                        onclick={() => changeLocale('zh')}
                >
                    中文
                </button>
                <button
                        type="button"
                        class="rounded-lg px-2 py-1 text-xs font-semibold text-white transition-colors {locale === 'en' ? 'bg-white/25' : 'hover:bg-white/15'}"
                        data-testid="locale-en-mobile"
                        data-ai-action="set-locale-en"
                        onclick={() => changeLocale('en')}
                >
                    EN
                </button>
            </div>
        </div>

        <div class="max-h-[calc(78dvh-3.75rem)] overflow-y-auto pr-1 flex flex-col gap-3">
            <GithubRepoButton
                    onClick={openGithubRepo}
                    testId="open-github-mobile"
                    className="flex w-full h-8 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
                        name="blur-level-mobile"
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
                <div class="h-8 grid grid-cols-2 rounded-lg bg-white/10 overflow-hidden">
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
                <div class="h-8 grid grid-cols-2 rounded-lg bg-white/10 overflow-hidden">
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

            <div class="flex flex-col gap-3">
                <div>
                    <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                        Accent Color
                    </div>
                    <div class="flex items-center gap-2">
                        <input
                                class="h-8 w-14 cursor-pointer rounded-lg border border-white/25 bg-transparent p-1"
                                type="color"
                                name="accent-color-mobile"
                                aria-label="Accent Color"
                                value={resolvedAccentColor}
                                oninput={updateAccentColor}
                        />
                        <button
                                type="button"
                                class="flex-1 h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                                onclick={resetAccentColor}
                        >
                            Reset Default
                        </button>
                    </div>
                </div>

                <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                    Text Align
                </div>
                <div class="h-8 grid grid-cols-3 rounded-lg bg-white/10 overflow-hidden">
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
                                name="credit-name-mobile"
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
                                        id="avatar-upload-mobile"
                                        class="block w-[80%] text-xs text-white file:mr-2 file:rounded-md file:border-0 file:bg-white/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                                        type="file"
                                        name="avatar-upload-mobile"
                                        accept="image/*"
                                        aria-label="Avatar"
                                        data-testid="avatar-upload-mobile"
                                        data-ai-action="upload-avatar"
                                        onchange={handleAvatarUpload}
                                />
                            {/if}
                            {#if avatarUrl}
                                <img
                                        class="w-8 h-8 rounded-full object-cover"
                                        src={avatarUrl}
                                        alt=""
                                        width="32"
                                        height="32"
                                />
                            {/if}
                            <button
                                    type="button"
                                    class="flex-1 h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                                    disabled={!avatarUrl}
                                    data-testid="clear-avatar-mobile"
                                    data-ai-action="clear-avatar"
                                    onclick={clearAvatar}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            <button
                    type="button"
                    class="w-full h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={exporting}
                    data-testid="export-image-mobile"
                    data-ai-action="export-image"
                    onclick={generateAndDownloadImage}
            >
                {exporting ? 'Generating...' : 'Generate & Download'}
            </button>

            {#if exportError}
                <p class="mt-2 text-xs text-red-300">{exportError}</p>
            {/if}
        </div>
    </div>
{/if}