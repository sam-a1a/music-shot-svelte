import type { Locale } from '$lib/i18n/index.svelte'
import { isRTL } from '$lib/i18n/index.svelte'

export type TextAlignMode = 'left' | 'center' | 'right'
export type ExportRatio = '3:4' | '9:16'
export type FrameTheme = 'dark' | 'light'

const STORAGE_CREDIT_NAME_KEY = 'music-shot:credit-name'
const STORAGE_AVATAR_URL_KEY = 'music-shot:avatar-url'
const STORAGE_SHOW_CREDIT_KEY = 'music-shot:show-credit'
const STORAGE_LOCALE_KEY = 'music-shot:locale'
const STORAGE_BLUR_LEVEL_KEY = 'music-shot:blur-level'
const STORAGE_EXPORT_RATIO_KEY = 'music-shot:export-ratio'
const STORAGE_FRAME_THEME_KEY = 'music-shot:frame-theme'
const STORAGE_TITLE_ALIGN_KEY = 'music-shot:title-align'
const STORAGE_DEBUG_PREFIX = '[credit-storage]'

export const GITHUB_REPO_URL = 'https://github.com/sam-a1a/MusicArt'

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  const normalized = (langs[0] || '').toLowerCase()
  if (normalized.startsWith('zh')) return 'zh'
  if (normalized.startsWith('ar')) return 'ar'
  if (normalized.startsWith('ru')) return 'ru'
  return 'en'
}

function parseSavedBlurLevel(raw: string | null): number {
  if (!raw) return 20
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 20
  return Math.min(40, Math.max(0, Math.round(parsed)))
}

function parseSavedExportRatio(raw: string | null): ExportRatio {
  return raw === '3:4' || raw === '9:16' ? raw : '3:4'
}

function parseSavedFrameTheme(raw: string | null): FrameTheme {
  return raw === 'dark' || raw === 'light' ? raw : 'dark'
}

function parseSavedTitleAlign(raw: string | null): TextAlignMode {
  return raw === 'left' || raw === 'center' || raw === 'right' ? raw : 'center'
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read avatar file'))
    reader.readAsDataURL(file)
  })
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load avatar image'))
    img.src = src
  })
}

async function compressAvatarToDataURL(file: File): Promise<string> {
  const sourceUrl = await readFileAsDataURL(file)
  const img = await loadImageElement(sourceUrl)
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
  if (webp && webp.startsWith('data:image/webp')) return webp
  return canvas.toDataURL('image/jpeg', 0.82)
}

function estimateStorageBytes(): number {
  let bytes = 0
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || ''
    const value = localStorage.getItem(key) || ''
    bytes += (key.length + value.length) * 2
  }
  return bytes
}

function setStorageItemWithLog(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    console.log(`${STORAGE_DEBUG_PREFIX} set-ok`, {
      key,
      valueLength: value.length,
      totalBytes: estimateStorageBytes(),
    })
  } catch (error) {
    console.error(`${STORAGE_DEBUG_PREFIX} set-failed`, {
      key,
      valueLength: value.length,
      error,
      totalBytes: estimateStorageBytes(),
    })
  }
}

function createAppSettings() {
  let blurLevel = $state(20)
  let titleAlign = $state<TextAlignMode>('center')
  let exportRatio = $state<ExportRatio>('3:4')
  let frameTheme = $state<FrameTheme>('dark')
  let customAccentColor = $state('')
  let creditName = $state('@your_name')
  let avatarUrl = $state('')
  let avatarFileInputRef: HTMLInputElement | null = $state(null)
  let showCredit = $state(true)
  let isMobilePanelOpen = $state(false)
  let locale = $state<Locale>('en')

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_LOCALE_KEY)
      if (saved === 'zh' || saved === 'en' || saved === 'ar' || saved === 'ru') {
        locale = saved
      } else {
        locale = detectBrowserLocale()
      }
    } catch {
      locale = detectBrowserLocale()
    }

    try {
      const savedName = localStorage.getItem(STORAGE_CREDIT_NAME_KEY)
      const savedAvatar = localStorage.getItem(STORAGE_AVATAR_URL_KEY)
      const savedShowCredit = localStorage.getItem(STORAGE_SHOW_CREDIT_KEY)
      const savedBlurLevel = localStorage.getItem(STORAGE_BLUR_LEVEL_KEY)
      const savedExportRatio = localStorage.getItem(STORAGE_EXPORT_RATIO_KEY)
      const savedFrameTheme = localStorage.getItem(STORAGE_FRAME_THEME_KEY)
      const savedTitleAlign = localStorage.getItem(STORAGE_TITLE_ALIGN_KEY)
      if (savedName) creditName = savedName
      if (savedAvatar) avatarUrl = savedAvatar
      if (savedShowCredit === 'true' || savedShowCredit === 'false') {
        showCredit = savedShowCredit === 'true'
      }
      blurLevel = parseSavedBlurLevel(savedBlurLevel)
      exportRatio = parseSavedExportRatio(savedExportRatio)
      frameTheme = parseSavedFrameTheme(savedFrameTheme)
      titleAlign = parseSavedTitleAlign(savedTitleAlign)
    } catch {
      console.error(`${STORAGE_DEBUG_PREFIX} mounted-read-failed`)
    }
  }

  function changeLocale(next: Locale) {
    locale = next
    try {
      localStorage.setItem(STORAGE_LOCALE_KEY, locale)
    } catch {
      // ignore
    }
  }

  function openGithubRepo() {
    window.open(GITHUB_REPO_URL, '_blank', 'noopener,noreferrer')
  }

  function toggleMobilePanel() {
    isMobilePanelOpen = !isMobilePanelOpen
  }

  function closeMobilePanel() {
    isMobilePanelOpen = false
  }

  function resetAccentColor() {
    customAccentColor = ''
  }

  function updateAccentColor(event: Event) {
    const target = event.target as HTMLInputElement
    customAccentColor = target.value || ''
  }

  function clearAvatar() {
    if (avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl)
    }
    avatarUrl = ''
    if (avatarFileInputRef) {
      avatarFileInputRef.value = ''
    }
  }

  async function handleAvatarUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    if (avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl)
    }
    console.log(`${STORAGE_DEBUG_PREFIX} upload-start`, {
      name: file.name,
      type: file.type,
      size: file.size,
    })
    avatarUrl = await compressAvatarToDataURL(file)
    console.log(`${STORAGE_DEBUG_PREFIX} upload-compressed`, {
      dataUrlLength: avatarUrl.length,
      approxKB: Math.round((avatarUrl.length * 2) / 1024),
    })
  }

  return {
    get blurLevel() { return blurLevel },
    set blurLevel(v) { blurLevel = v; setStorageItemWithLog(STORAGE_BLUR_LEVEL_KEY, String(v)) },
    get titleAlign() { return titleAlign },
    set titleAlign(v) { titleAlign = v; setStorageItemWithLog(STORAGE_TITLE_ALIGN_KEY, v) },
    get exportRatio() { return exportRatio },
    set exportRatio(v) { exportRatio = v; setStorageItemWithLog(STORAGE_EXPORT_RATIO_KEY, v) },
    get frameTheme() { return frameTheme },
    set frameTheme(v) { frameTheme = v; setStorageItemWithLog(STORAGE_FRAME_THEME_KEY, v) },
    get customAccentColor() { return customAccentColor },
    set customAccentColor(v) { customAccentColor = v },
    get creditName() { return creditName },
    set creditName(v) { creditName = v; setStorageItemWithLog(STORAGE_CREDIT_NAME_KEY, v) },
    get avatarUrl() { return avatarUrl },
    set avatarUrl(v) { avatarUrl = v; setStorageItemWithLog(STORAGE_AVATAR_URL_KEY, v) },
    get avatarFileInputRef() { return avatarFileInputRef },
    set avatarFileInputRef(v) { avatarFileInputRef = v },
    get showCredit() { return showCredit },
    set showCredit(v) { showCredit = v; setStorageItemWithLog(STORAGE_SHOW_CREDIT_KEY, String(v)) },
    get isMobilePanelOpen() { return isMobilePanelOpen },
    set isMobilePanelOpen(v) { isMobilePanelOpen = v },
    get locale() { return locale },
    set locale(v) { locale = v },
    get dir() { return isRTL(locale) ? 'rtl' : 'ltr' },
    init,
    changeLocale,
    openGithubRepo,
    toggleMobilePanel,
    closeMobilePanel,
    resetAccentColor,
    updateAccentColor,
    clearAvatar,
    handleAvatarUpload,
  }
}

export const appSettings = createAppSettings()
