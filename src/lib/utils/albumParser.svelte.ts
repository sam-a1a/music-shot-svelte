import type { AlbumData } from '$lib/services/appleMusic'
import { MusicLinkParser } from '$lib/services/appleMusic'

export type ViewState = 'input' | 'result'

/** Validated up front so the user gets a precise message before any network call. */
function validateAlbumUrl(rawUrl: string): string {
  if (!rawUrl.trim()) throw new Error('Please enter a URL')

  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    throw new Error('Invalid URL format')
  }

  const hostname = url.hostname.toLowerCase()
  const pathname = decodeURIComponent(url.pathname)

  if (hostname.includes('spotify.com')) {
    if (!/\/(album|track)\/[a-zA-Z0-9]+(?:\/|$)/.test(pathname)) {
      throw new Error('Invalid Spotify album or track URL')
    }
    return url.toString()
  }

  if (hostname.includes('apple.com')) {
    if (!/\/album\/.+\/\d+(?:\?|$|\/)/.test(pathname)) {
      throw new Error('Invalid Apple Music album URL')
    }
    return url.toString()
  }

  throw new Error('Unsupported platform')
}

class AlbumParser {
  #parser = new MusicLinkParser()

  viewState = $state<ViewState>('input')
  inputUrl = $state('')
  loading = $state(false)
  errorMsg = $state('')
  albumData = $state<AlbumData | null>(null)

  handleSubmit = async (onSuccess?: () => void) => {
    this.errorMsg = ''
    try {
      const cleanedUrl = validateAlbumUrl(this.inputUrl)
      this.loading = true
      this.albumData = await this.#parser.parse(cleanedUrl)
      this.viewState = 'result'
      onSuccess?.()
    } catch (error) {
      this.errorMsg = (error as Error).message || 'Failed to parse album'
      if (import.meta.env.DEV) console.error('[albumParser] parse failed:', error)
    } finally {
      this.loading = false
    }
  }

  handleBack = () => {
    this.viewState = 'input'
    this.inputUrl = ''
  }
}

export const albumParser = new AlbumParser()
