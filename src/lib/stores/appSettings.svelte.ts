import type { Locale } from '$lib/i18n/index.svelte'
import { isRTL } from '$lib/i18n/index.svelte'
import { albumParser } from '$lib/utils/albumParser.svelte'

export type TextAlignMode = 'left' | 'center' | 'right'
export type ExportRatio = '3:4' | '9:16'
export type FrameTheme = 'dark' | 'light'

export const GITHUB_REPO_URL = 'https://github.com/sam-a1a/MusicArt'

const KEY = {
  creditName: 'music-shot:credit-name',
  avatarUrl: 'music-shot:avatar-url',
  showCredit: 'music-shot:show-credit',
  locale: 'music-shot:locale',
  blurLevel: 'music-shot:blur-level',
  exportRatio: 'music-shot:export-ratio',
  frameTheme: 'music-shot:frame-theme',
  titleAlign: 'music-shot:title-align',
} as const

const PLATFORM_ACCENT = { AppleMusic: '#ff4e6b', Spotify: '#1ed760' } as const

/**
 * Writes are coalesced onto a timer: dragging the blur slider fires an input
 * event per pixel, and localStorage.setItem is synchronous main-thread work.
 */
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a plain write buffer; nothing renders from it
const pending = new Map<string, string>()
let flushTimer: ReturnType<typeof setTimeout> | undefined

function flush() {
  flushTimer = undefined
  for (const [key, value] of pending) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Quota exceeded or storage blocked - settings just won't survive a reload.
    }
  }
  pending.clear()
}

function persist(key: string, value: string) {
  pending.set(key, value)
  flushTimer ??= setTimeout(flush, 300)
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function detectBrowserLocale(): Locale {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  const normalized = (langs[0] || '').toLowerCase()
  if (normalized.startsWith('zh')) return 'zh'
  if (normalized.startsWith('ar')) return 'ar'
  if (normalized.startsWith('ru')) return 'ru'
  return 'en'
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read avatar file'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load avatar image'))
    img.src = src
  })
}

async function compressAvatarToDataURL(file: File): Promise<string> {
  const img = await loadImageElement(await readFileAsDataURL(file))
  const maxSide = 160
  const srcW = Math.max(1, img.naturalWidth || img.width)
  const srcH = Math.max(1, img.naturalHeight || img.height)
  const scale = Math.min(1, maxSide / Math.max(srcW, srcH))
  const outW = Math.max(1, Math.round(srcW * scale))
  const outH = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to compress avatar')
  ctx.drawImage(img, 0, 0, outW, outH)

  const webp = canvas.toDataURL('image/webp', 0.82)
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82)
}

class AppSettings {
  blurLevel = $state(20)
  titleAlign = $state<TextAlignMode>('center')
  exportRatio = $state<ExportRatio>('3:4')
  frameTheme = $state<FrameTheme>('dark')
  customAccentColor = $state('')
  creditName = $state('@your_name')
  avatarUrl = $state('')
  showCredit = $state(true)
  isMobilePanelOpen = $state(false)
  locale = $state<Locale>('en')

  /** Custom color wins; otherwise the source platform's brand color. */
  get accentColor() {
    return this.customAccentColor || PLATFORM_ACCENT[albumParser.albumData?.platform ?? 'Spotify']
  }

  get dir() {
    return isRTL(this.locale) ? 'rtl' : 'ltr'
  }

  /** Browser-only: restores saved settings, then keeps localStorage in sync. */
  init = () => {
    const savedLocale = read(KEY.locale)
    this.locale =
      savedLocale === 'zh' || savedLocale === 'en' || savedLocale === 'ar' || savedLocale === 'ru'
        ? savedLocale
        : detectBrowserLocale()

    const savedBlur = read(KEY.blurLevel)
    if (savedBlur && Number.isFinite(Number(savedBlur))) {
      this.blurLevel = Math.min(40, Math.max(0, Math.round(Number(savedBlur))))
    }

    const ratio = read(KEY.exportRatio)
    if (ratio === '3:4' || ratio === '9:16') this.exportRatio = ratio

    const theme = read(KEY.frameTheme)
    if (theme === 'dark' || theme === 'light') this.frameTheme = theme

    const align = read(KEY.titleAlign)
    if (align === 'left' || align === 'center' || align === 'right') this.titleAlign = align

    const name = read(KEY.creditName)
    if (name) this.creditName = name

    const avatar = read(KEY.avatarUrl)
    if (avatar) this.avatarUrl = avatar

    const credit = read(KEY.showCredit)
    if (credit === 'true' || credit === 'false') this.showCredit = credit === 'true'

    $effect.root(() => {
      $effect(() => persist(KEY.locale, this.locale))
      $effect(() => persist(KEY.blurLevel, String(this.blurLevel)))
      $effect(() => persist(KEY.exportRatio, this.exportRatio))
      $effect(() => persist(KEY.frameTheme, this.frameTheme))
      $effect(() => persist(KEY.titleAlign, this.titleAlign))
      $effect(() => persist(KEY.creditName, this.creditName))
      $effect(() => persist(KEY.avatarUrl, this.avatarUrl))
      $effect(() => persist(KEY.showCredit, String(this.showCredit)))
    })

    // A pending debounced write would otherwise be lost when the tab goes away.
    addEventListener('pagehide', flush)
  }

  changeLocale = (next: Locale) => {
    this.locale = next
  }

  openGithubRepo = () => {
    window.open(GITHUB_REPO_URL, '_blank', 'noopener,noreferrer')
  }

  toggleMobilePanel = () => {
    this.isMobilePanelOpen = !this.isMobilePanelOpen
  }

  closeMobilePanel = () => {
    this.isMobilePanelOpen = false
  }

  resetAccentColor = () => {
    this.customAccentColor = ''
  }

  updateAccentColor = (event: Event) => {
    this.customAccentColor = (event.target as HTMLInputElement).value || ''
  }

  clearAvatar = () => {
    this.avatarUrl = ''
  }

  handleAvatarUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    this.avatarUrl = await compressAvatarToDataURL(file)
  }
}

export const appSettings = new AppSettings()
