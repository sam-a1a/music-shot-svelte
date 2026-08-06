<script lang="ts">
    import losslessLogo from '$lib/assets/Apple_Lossless_logo.png'
    import type { AlbumData } from '$lib/services/appleMusic'
    import { appSettings } from '$lib/stores/appSettings.svelte'
    import { imageExport } from '$lib/utils/imageExport.svelte'

    let { albumData }: { albumData: AlbumData } = $props()

    const THEME = {
        dark: {
            screen: 'bg-surface-dim text-on-surface',
            overlay:
                'absolute inset-x-0 top-0 bg-gradient-to-b from-surface-dim/20 via-surface-dim/80 to-surface-dim',
            title: 'font-headline text-3xl font-extrabold tracking-tighter text-white leading-tight max-md:text-3xl',
            meta: 'text-sm font-medium text-on-surface-variant/60 font-headline max-md:text-xs',
            trackTitle:
                'text-sm font-semibold text-white overflow-hidden text-ellipsis whitespace-nowrap',
            trackArtist: 'text-xs text-on-surface-variant',
            trackDuration: 'text-sm font-medium text-on-surface-variant/40 tabular-nums'
        },
        light: {
            screen: 'bg-[#f6f7f9] text-[#101114]',
            overlay: 'absolute inset-x-0 top-0 bg-gradient-to-b from-white via-white/80 to-white/20',
            title: 'font-headline text-3xl font-extrabold tracking-tighter text-black leading-tight max-md:text-3xl',
            meta: 'text-sm font-medium text-black/55 font-headline max-md:text-xs',
            trackTitle:
                'text-sm font-semibold text-black overflow-hidden text-ellipsis whitespace-nowrap',
            trackArtist: 'text-xs text-black/55',
            trackDuration: 'text-sm font-medium text-black/45 tabular-nums'
        }
    } as const

    const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

    let rootRef = $state<HTMLElement | null>(null)
    let contentRef = $state<HTMLElement | null>(null)
    let overlayHeightPx = $state(0)

    let theme = $derived(THEME[appSettings.frameTheme])
    let accent = $derived(appSettings.accentColor)
    let overlayStyle = $derived(overlayHeightPx ? `height: ${overlayHeightPx}px` : 'height: 100%')

    $effect(() => {
        imageExport.resultScreenRef = rootRef
    })

    // The overlay gradient has to span the scrollable content, not just the viewport.
    $effect(() => {
        const root = rootRef
        const content = contentRef
        if (!root || !content) return

        const sync = () => {
            overlayHeightPx = Math.max(Math.ceil(content.scrollHeight), Math.ceil(root.clientHeight))
        }
        sync()

        const observer = new ResizeObserver(sync)
        observer.observe(root)
        observer.observe(content)
        return () => observer.disconnect()
    })

    function formatDuration(seconds: number): string {
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    }

    function formatYear(releaseDate: string): string {
        const date = new Date(releaseDate)
        if (Number.isNaN(date.getTime())) return releaseDate.slice(0, 4) || 'Unknown'
        return String(date.getFullYear())
    }
</script>

<div
        bind:this={rootRef}
        class="relative h-full w-full overflow-x-hidden overflow-y-auto font-body scrollbar-none [&::-webkit-scrollbar]:hidden {theme.screen} {imageExport.exportRenderMode ? '**:transition-none' : ''}"
>
    <div class="absolute inset-0 z-0 pointer-events-none">
        <img
                class="w-full h-full object-cover opacity-40 scale-110 blur-3xl"
                src={albumData.cover_url}
                alt="{albumData.title} cover"
                width="1000"
                height="1000"
                fetchpriority="high"
        />
        <div class={theme.overlay} style={overlayStyle}></div>
    </div>

    <main
            bind:this={contentRef}
            class="relative z-10 mx-auto max-w-lg px-5 py-10 max-md:px-4 max-md:pb-24 max-md:pt-8"
    >
        <section class="flex flex-col items-center mb-6">
            <div class="relative group mb-5 w-full px-5 max-md:mb-4 max-md:px-3">
                <img
                        class="relative z-10 h-auto w-full rounded-lg object-cover shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
                        src={albumData.cover_url}
                        alt="{albumData.title} artwork"
                        width="1000"
                        height="1000"
                        fetchpriority="high"
                />
            </div>

            <div class="w-full space-y-1 {ALIGN[appSettings.titleAlign]}">
                <h2 class={theme.title}>
                    {albumData.title}
                </h2>
                <p class="text-xl font-medium font-headline max-md:text-lg" style="color: {accent}">
                    {albumData.artist}
                </p>
                {#if albumData.platform === 'AppleMusic' && (albumData.genre || albumData.release_date)}
                    <p class={theme.meta}>
                        {albumData.genre || 'Unknown'}
                        <span class="mx-1">·</span>
                        {formatYear(albumData.release_date)}
                        <span class="mx-1">·</span>
                        <img
                                class="h-3 mx-1 inline"
                                src={losslessLogo}
                                alt=""
                                aria-hidden="true"
                                data-ai-hidden="true"
                                width="86"
                                height="60"
                        />
                        Lossless
                    </p>
                {/if}
            </div>

            <div class="mt-6 flex w-full h-14 gap-0 rounded-full bg-black max-md:mt-4">
                <button
                        type="button"
                        class="flex h-[calc(100%+2px)] flex-1 items-center justify-center gap-2 rounded-full border-0 bg-white text-black font-headline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 transition-opacity max-md:text-sm -translate-x-px -translate-y-px"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"/>
                    </svg>
                    Play
                </button>
                <button
                        type="button"
                        class="h-14 w-[47%] flex items-center justify-center gap-2 rounded-r-full border-0 bg-black text-white font-headline font-bold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 max-md:text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shuffle-icon lucide-shuffle size-6">
                        <path d="m18 14 4 4-4 4"/>
                        <path d="m18 2 4 4-4 4"/>
                        <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/>
                        <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/>
                        <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>
                    </svg>
                    Shuffle
                </button>
            </div>
        </section>

        <section class="space-y-1">
            {#each albumData.tracks as track, index (`${track.track_number}-${track.name}`)}
                {@const isCurrent = index === 0}
                <div
                        class="w-full group flex items-center gap-5 p-4 rounded-xl transition-colors max-md:gap-3 max-md:p-3 {isCurrent ? 'bg-white/5' : 'hover:bg-white/5'}"
                >
                    {#if isCurrent}
                        <div class="w-6 text-center">
                            <div class="flex items-end justify-center gap-0.5 h-4">
                                <div class="w-1 rounded-full h-full" style="background-color: {accent}"></div>
                                <div class="w-1 rounded-full h-2" style="background-color: {accent}"></div>
                                <div class="w-1 rounded-full h-3" style="background-color: {accent}"></div>
                            </div>
                        </div>
                    {:else}
                        <span class="w-6 text-center text-sm font-medium text-on-surface-variant/80 tabular-nums group-hover:hidden" aria-hidden="true">
                            {String(track.track_number).padStart(2, '0')}
                        </span>
                        <span class="sr-only">Track {String(track.track_number).padStart(2, '0')}</span>
                        <span class="w-6 text-center hidden group-hover:block" style="color: {accent}" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"/>
                            </svg>
                        </span>
                    {/if}
                    <div class="flex-1 min-w-0">
                        <p
                                class={isCurrent
                                    ? 'text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap'
                                    : theme.trackTitle}
                                style={isCurrent ? `color: ${accent}` : undefined}
                        >
                            {track.name}
                        </p>
                        <p class={theme.trackArtist}>{track.artist}</p>
                    </div>
                    <div class="flex items-center gap-4 ml-auto">
                        <span
                                class={isCurrent ? 'text-sm font-medium tabular-nums' : theme.trackDuration}
                                style={isCurrent ? `color: ${accent}` : undefined}
                        >
                            {formatDuration(track.duration_s)}
                        </span>
                    </div>
                </div>
            {/each}
        </section>
    </main>
</div>
