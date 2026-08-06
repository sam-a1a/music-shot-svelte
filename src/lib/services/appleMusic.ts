import type { AppleMusicWebSchema, SpotifyEmbedResponse } from '../types'
import type { AppleMusicSerializedServerData } from '../types/appleMusic'

export interface Track {
  name: string
  artist: string
  duration_s: number
  track_number: number
}

export interface AlbumData {
  title: string
  artist: string
  genre?: string
  cover_url: string
  release_date: string
  tracks: Track[]
  platform: 'Spotify' | 'AppleMusic'
}

export class MusicLinkParser {
  private readonly PROXY = 'https://music-shot-proxy.0v0.one/?url='

  async parse(url: string): Promise<AlbumData> {
    if (url.includes('spotify.com')) {
      return this.parseSpotify(url)
    } else if (url.includes('apple.com')) {
      return this.parseAppleMusicWeb(url)
    } else {
      throw new Error('Unsupported platform')
    }
  }

  /** Handles both /album/<id> and /track/<id> links; the embed payload differs per kind. */
  private async parseSpotify(url: string): Promise<AlbumData> {
    const match = url.match(/\/(album|track)\/([a-zA-Z0-9]+)/)
    const kind = match?.[1]
    const id = match?.[2]
    if (!kind || !id) throw new Error('Invalid Spotify album or track URL')

    const entity = await this.fetchSpotifyEntity(`https://open.spotify.com/embed/${kind}/${id}`)

    const images = Array.isArray(entity.visualIdentity?.image) ? entity.visualIdentity.image : []
    const bestImage = images.reduce(
      (best, current) => ((current?.maxWidth ?? 0) > (best?.maxWidth ?? 0) ? current : best),
      images[0],
    )
    const title = entity.title || entity.name || ''
    // Album embeds carry the artist in `subtitle`; track embeds use an `artists` array.
    const artist =
      entity.subtitle || (entity.artists ?? []).map((a) => a.name).filter(Boolean).join(', ')

    const shared = {
      title,
      artist,
      cover_url: bestImage?.url || '',
      release_date: entity.releaseDate?.isoString || '',
      platform: 'Spotify' as const,
    }

    if (kind === 'track') {
      return {
        ...shared,
        tracks: [
          {
            name: title,
            artist,
            duration_s: Math.floor((entity.duration ?? 0) / 1000),
            track_number: 1,
          },
        ],
      }
    }

    const tracks = Array.isArray(entity.trackList) ? entity.trackList : []
    return {
      ...shared,
      tracks: tracks.map((t, i) => ({
        name: t.title || '',
        artist: t.subtitle || artist,
        duration_s: Math.floor((t.duration ?? 0) / 1000),
        track_number: i + 1,
      })),
    }
  }

  private async fetchSpotifyEntity(embedUrl: string) {
    const response = await fetch(`${this.PROXY}${encodeURIComponent(embedUrl)}`)
    if (!response.ok) throw new Error('Failed to parse album')

    const html = this.extractHtmlFromProxyResponse(await response.text())
    const nextDataRaw = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1]
    if (!nextDataRaw) throw new Error('Failed to parse album')

    const nextData: SpotifyEmbedResponse = JSON.parse(nextDataRaw)
    const entity = nextData?.props?.pageProps?.state?.data?.entity
    if (!entity) throw new Error('Failed to parse album')
    return entity
  }

  private extractHtmlFromProxyResponse(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) throw new Error('Failed to parse album')

    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      return trimmed
    }

    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed?.contents === 'string' && parsed.contents.trim()) {
          return parsed.contents
        }
        if (typeof parsed?.data === 'string' && parsed.data.trim()) {
          return parsed.data
        }
      } catch {
        // Ignore
      }
    }

    throw new Error('Failed to parse album')
  }

  private async parseAppleMusicWeb(url: string): Promise<AlbumData> {
    const response = await fetch(`${this.PROXY}${encodeURIComponent(url)}`)
    if (!response.ok) throw new Error('Failed to parse album')
    const proxyRaw = await response.text()
    const html = this.extractHtmlFromProxyResponse(proxyRaw)

    const regex = /<script id=schema:music-album[^>]*>([\s\S]*?)<\/script>/
    const serverDataRegex =
      /<script[^>]*id=["']serialized-server-data["'][^>]*>([\s\S]*?)<\/script>/

    const match = html.match(regex)
    if (!match) throw new Error('Failed to parse album')
    const schemaRaw = match[1]
    if (!schemaRaw) throw new Error('Failed to parse album')

    const serverDataMatch = html.match(serverDataRegex)
    if (!serverDataMatch) throw new Error('Failed to parse album')
    const serverDataRaw = serverDataMatch[1]
    if (!serverDataRaw) throw new Error('Failed to parse album')

    let data: AppleMusicWebSchema
    let serverData: AppleMusicSerializedServerData
    try {
      data = JSON.parse(schemaRaw)
      serverData = JSON.parse(serverDataRaw)
    } catch (error) {
      throw new Error('Apple schema JSON or server data JSON parse failed', { cause: error })
    }

    const trackSection = serverData.data[0]?.data.sections.find(
      (item) => item.itemKind === 'trackLockup',
    )
    const artistList =
      (trackSection &&
        trackSection.items.map((item) =>
          (item.subtitleLinks || []).map((s) => s.title || '').join(', '),
        )) ||
      []

    return {
      title: data.name,
      artist: data.byArtist[0] ? data.byArtist[0].name : '',
      cover_url: data.image.replace('{w}x{h}bb', '1000x1000bb'),
      release_date: data.datePublished,
      platform: 'AppleMusic',
      genre: data.genre ? data.genre[0] : 'Unknown',
      tracks: data.tracks.map((t, i) => ({
        name: t.name,
        artist: artistList[i] || (data.byArtist[0] ? data.byArtist[0].name : ''),
        duration_s: this.parseISO8601Duration(t.duration),
        track_number: i + 1,
      })),
    }
  }

  private parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(\d+M)?(\d+S)?/)
    if (!match) return 0
    const minutes = parseInt(match[1] || '0', 10) || 0
    const seconds = parseInt(match[2] || '0', 10) || 0
    return minutes * 60 + seconds
  }
}
