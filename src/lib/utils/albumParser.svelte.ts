import type { AlbumData } from '$lib/services/appleMusic'
import { MusicLinkParser } from '$lib/services/appleMusic'

export type ViewState = 'input' | 'result'
type Platform = 'Spotify' | 'AppleMusic'

function detectAndValidateAlbumUrl(rawUrl: string): { platform: Platform; cleanedUrl: string } {
  if (!rawUrl.trim()) {
    throw new Error('Please enter a URL')
  }

  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    throw new Error('Invalid URL format')
  }

  const hostname = url.hostname.toLowerCase()
  const pathname = decodeURIComponent(url.pathname)

  const spotifyMatch = pathname.match(/\/album\/([a-zA-Z0-9]+)(?:\/|$)/)
  if (hostname.includes('spotify.com')) {
    if (!spotifyMatch) throw new Error('Invalid Spotify album URL')
    return { platform: 'Spotify', cleanedUrl: url.toString() }
  }

  const appleMatch = pathname.match(/\/album\/.+\/(\d+)(?:\?|$|\/)/)
  if (hostname.includes('apple.com')) {
    if (!appleMatch) throw new Error('Invalid Apple Music album URL')
    return { platform: 'AppleMusic', cleanedUrl: url.toString() }
  }

  throw new Error('Unsupported platform')
}

function createAlbumParser() {
  const parser = new MusicLinkParser()

  let viewState = $state<ViewState>('input')
  let inputUrl = $state('')
  let loading = $state(false)
  let errorMsg = $state('')
  let albumData = $state<AlbumData | null>(null)

  async function handleSubmit(onSuccess?: () => void) {
    errorMsg = ''
    try {
      const { cleanedUrl } = detectAndValidateAlbumUrl(inputUrl)
      loading = true
      const result = await parser.parse(cleanedUrl)
      console.log(result)
      albumData = result
      viewState = 'result'
      onSuccess?.()
    } catch (error) {
      console.error('[handleSubmit] parse failed:', error)
      if (error instanceof Error) {
        console.error('[handleSubmit] stack:', error.stack)
        if (error.cause) {
          console.error('[handleSubmit] cause:', error.cause)
        }
      }
      errorMsg = (error as Error).message || 'Failed to parse album'
    } finally {
      loading = false
    }
  }

  function handleBack() {
    viewState = 'input'
    inputUrl = ''
  }

  return {
    get viewState() { return viewState },
    set viewState(v) { viewState = v },
    get inputUrl() { return inputUrl },
    set inputUrl(v) { inputUrl = v },
    get loading() { return loading },
    get errorMsg() { return errorMsg },
    set errorMsg(v) { errorMsg = v },
    get albumData() { return albumData },
    set albumData(v) { albumData = v },
    handleSubmit,
    handleBack,
  }
}

export const albumParser = createAlbumParser()
