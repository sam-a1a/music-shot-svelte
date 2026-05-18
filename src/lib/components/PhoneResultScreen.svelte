<script lang="ts">
    import { onMount, onDestroy } from 'svelte'

    interface Track {
        track_number: number
        name: string
        artist: string
        duration_s: number
    }

    interface AlbumData {
        title: string
        artist: string
        genre?: string
        release_date: string
        platform: string
        tracks: Track[]
    }

    let {
        onRootRef,
        albumData,
        coverUrl,
        exportRenderMode,
        resultScreenThemeClass,
        resultOverlayClass,
        titleAlignClass,
        resultTitleClass,
        resolvedAccentColor,
        resultMetaClass,
        trackArtistClass,
        trackTitleClass,
        trackDurationMutedClass,
        formatYear,
        formatDuration,
    }: {
        onRootRef: (el: HTMLElement) => void
        albumData: AlbumData
        coverUrl: string
        exportRenderMode: boolean
        resultScreenThemeClass: string
        resultOverlayClass: string
        titleAlignClass: string
        resultTitleClass: string
        resolvedAccentColor: string
        resultMetaClass: string
        trackArtistClass: string
        trackTitleClass: string
        trackDurationMutedClass: string
        formatYear: (releaseDate: string) => string
        formatDuration: (seconds: number) => string
    } = $props()

    let rootRef: HTMLElement
    let contentRef: HTMLElement
    let overlayHeightPx = $state(0)

    let overlayStyle = $derived(
        overlayHeightPx ? `height: ${overlayHeightPx}px` : 'height: 100%'
    )

    // Sync local rootRef to the parent via callback
    $effect(() => {
        if (rootRef) onRootRef(rootRef)
    })

    function syncOverlayHeight() {
        if (!rootRef) return
        const contentHeight = Math.ceil(contentRef?.scrollHeight ?? 0)
        const viewportHeight = Math.ceil(rootRef.clientHeight)
        overlayHeightPx = Math.max(contentHeight, viewportHeight)
    }

    let resizeObserver: ResizeObserver | null = null

    onMount(() => {
        syncOverlayHeight()
        resizeObserver = new ResizeObserver(() => {
            syncOverlayHeight()
        })
        if (rootRef) resizeObserver.observe(rootRef)
        if (contentRef) resizeObserver.observe(contentRef)
    })

    onDestroy(() => {
        resizeObserver?.disconnect()
        resizeObserver = null
    })
</script>

<div
        bind:this={rootRef}
        class="relative h-full w-full overflow-x-hidden overflow-y-auto font-body scrollbar-none [&::-webkit-scrollbar]:hidden {resultScreenThemeClass} {exportRenderMode ? '**:transition-none' : ''}"
>
    <div class="absolute inset-0 z-0 pointer-events-none">
        <img
                class="w-full h-full object-cover opacity-40 scale-110 blur-3xl"
                src={coverUrl}
                alt="{albumData.title} cover"
                width="1000"
                height="1000"
        />
        <div class={resultOverlayClass} style={overlayStyle}></div>
    </div>

    <main
            bind:this={contentRef}
            class="relative z-10 mx-auto max-w-lg px-5 py-10 max-md:px-4 max-md:pb-24 max-md:pt-8"
    >
        <section class="flex flex-col items-center mb-6">
            <div class="relative group mb-5 w-full px-5 max-md:mb-4 max-md:px-3">
                <img
                        class="relative z-10 h-auto w-full rounded-lg object-cover shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
                        src={coverUrl}
                        alt="{albumData.title} artwork"
                        width="1000"
                        height="1000"
                />
            </div>

            <div class="w-full space-y-1 {titleAlignClass}">
                <h2 class={resultTitleClass}>
                    {albumData.title}
                </h2>
                <p
                        class="text-xl font-medium font-headline max-md:text-lg"
                        style="color: {resolvedAccentColor}"
                >
                    {albumData.artist}
                </p>
                {#if albumData.platform === 'AppleMusic' && (albumData.genre || albumData.release_date)}
                    <p class={resultMetaClass}>
                        {albumData.genre || 'Unknown'}
                        <span class="mx-1">·</span>
                        {formatYear(albumData.release_date)}
                        <span class="mx-1">·</span>
                        <img
                                class="h-3 mx-1 inline"
                                src="$lib/assets/Apple_Lossless_logo.png"
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
                {#if index === 0}
                    <div class="w-full group flex items-center gap-5 p-4 rounded-xl bg-white/5 transition-colors max-md:gap-3 max-md:p-3">
                        <div class="w-6 text-center">
                            <div class="flex items-end justify-center gap-0.5 h-4">
                                <div class="w-1 rounded-full h-full" style="background-color: {resolvedAccentColor}"></div>
                                <div class="w-1 rounded-full h-2" style="background-color: {resolvedAccentColor}"></div>
                                <div class="w-1 rounded-full h-3" style="background-color: {resolvedAccentColor}"></div>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style="color: {resolvedAccentColor}">
                                {track.name}
                            </p>
                            <p class={trackArtistClass}>{track.artist}</p>
                        </div>
                        <div class="flex items-center gap-4 ml-auto">
                            <span class="text-sm font-medium tabular-nums" style="color: {resolvedAccentColor}">{formatDuration(track.duration_s)}</span>
                        </div>
                    </div>
                {:else}
                    <div class="w-full group flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 transition-colors max-md:gap-3 max-md:p-3">
                        <span class="w-6 text-center text-sm font-medium text-on-surface-variant/80 tabular-nums group-hover:hidden" aria-hidden="true">
                            {String(track.track_number).padStart(2, '0')}
                        </span>
                        <span class="sr-only">Track {String(track.track_number).padStart(2, '0')}</span>
                        <span class="w-6 text-center hidden group-hover:block" style="color: {resolvedAccentColor}" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"/>
                            </svg>
                        </span>
                        <div class="flex-1 min-w-0">
                            <p class={trackTitleClass}>{track.name}</p>
                            <p class={trackArtistClass}>{track.artist}</p>
                        </div>
                        <div class="flex items-center gap-4 ml-auto">
                            <span class={trackDurationMutedClass}>{formatDuration(track.duration_s)}</span>
                        </div>
                    </div>
                {/if}
            {/each}
        </section>
    </main>
</div>