import { tick } from 'svelte'
import { appSettings } from '$lib/stores/appSettings.svelte'
import type { ExportRatio } from '$lib/stores/appSettings.svelte'
import { albumParser } from './albumParser.svelte'

const EXPORT_FRAME_HEIGHT_RATIO = 0.9
const EXPORT_SIZE: Record<ExportRatio, { width: number; height: number }> = {
  '3:4': { width: 2400, height: 3200 },
  '9:16': { width: 1620, height: 2880 },
}

let snapdomLib: typeof import('@zumer/snapdom') | null = null

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load cover image'))
    img.src = src
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}

/** Cover-fits the artwork into the canvas, blurred, mirroring the on-screen backdrop. */
function drawBlurredBackdrop(
  ctx: CanvasRenderingContext2D,
  cover: HTMLImageElement,
  width: number,
  height: number,
  blurPx: number,
) {
  const scale = Math.max(width / cover.width, height / cover.height)
  const drawW = cover.width * scale
  const drawH = cover.height * scale

  ctx.save()
  ctx.filter = `blur(${blurPx}px)`
  ctx.drawImage(cover, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH)
  ctx.restore()
}

async function drawExportCredit(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  name: string,
  avatarSrc: string,
  imageCache: Map<string, HTMLImageElement>,
) {
  const text = name.trim()
  if (!text) return

  const avatarSize = Math.round(Math.min(canvasWidth, canvasHeight) * 0.035)
  const textSize = Math.max(20, Math.round(Math.min(canvasWidth, canvasHeight) * 0.018))
  const gap = Math.max(8, Math.round(avatarSize * 0.3))
  const margin = Math.round(Math.min(canvasWidth, canvasHeight) * 0.02)

  ctx.save()
  ctx.font = `600 ${textSize}px Inter, sans-serif`
  const textMetrics = ctx.measureText(text)
  const textLeftInk = Math.max(0, Math.ceil(textMetrics.actualBoundingBoxLeft ?? 0))
  const textRightInk = Math.max(
    Math.ceil(textMetrics.width),
    Math.ceil(textMetrics.actualBoundingBoxRight ?? textMetrics.width),
  )
  const textAscent = Math.max(
    textSize * 0.8,
    Math.ceil(textMetrics.actualBoundingBoxAscent ?? textSize * 0.8),
  )
  const textDescent = Math.max(
    textSize * 0.2,
    Math.ceil(textMetrics.actualBoundingBoxDescent ?? textSize * 0.2),
  )
  const textInkWidth = Math.max(1, textLeftInk + textRightInk)
  const textInkHeight = Math.max(1, textAscent + textDescent)
  const hasAvatar = !!avatarSrc
  const contentWidth = (hasAvatar ? avatarSize + gap : 0) + textInkWidth
  const contentHeight = Math.max(avatarSize, textInkHeight)
  const x = canvasWidth - margin - contentWidth
  const y = canvasHeight - margin - contentHeight
  const textLeft = x + (hasAvatar ? avatarSize + gap : 0)
  const textDrawX = textLeft + textLeftInk
  const textBaselineY = y + Math.round((contentHeight - textInkHeight) / 2) + textAscent

  if (hasAvatar) {
    let avatar = imageCache.get(avatarSrc)
    if (!avatar) {
      avatar = await loadImage(avatarSrc)
      imageCache.set(avatarSrc, avatar)
    }
    const avatarY = Math.round(y + (contentHeight - avatarSize) / 2)
    const sourceWidth = Math.max(1, avatar.naturalWidth || avatar.width)
    const sourceHeight = Math.max(1, avatar.naturalHeight || avatar.height)
    const sourceSide = Math.min(sourceWidth, sourceHeight)
    const sourceX = Math.round((sourceWidth - sourceSide) / 2)
    const sourceY = Math.round((sourceHeight - sourceSide) / 2)
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(
      avatar,
      sourceX,
      sourceY,
      sourceSide,
      sourceSide,
      x,
      avatarY,
      avatarSize,
      avatarSize,
    )
    ctx.restore()
  }

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, textDrawX, textBaselineY)
  ctx.restore()
}

async function getSnapdom() {
  snapdomLib ??= await import('@zumer/snapdom')
  return snapdomLib.snapdom
}

class ImageExport {
  phoneFrameRef = $state<HTMLElement | null>(null)
  resultScreenRef = $state<HTMLElement | null>(null)
  exporting = $state(false)
  exportError = $state('')
  exportRenderMode = $state(false)

  #fileName() {
    const safeTitle =
      (albumParser.albumData?.title || 'album').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'album'
    return `${safeTitle}_${appSettings.exportRatio.replace(':', 'x')}.png`
  }

  generateAndDownloadImage = async () => {
    const coverUrl = albumParser.albumData?.cover_url ?? ''
    if (!coverUrl || !this.phoneFrameRef || !this.resultScreenRef || this.exporting) return

    this.exporting = true
    this.exportError = ''
    this.exportRenderMode = true
    const startedAt = performance.now()
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- export-local cache; reactivity would only add overhead
    const imageCache = new Map<string, HTMLImageElement>()

    try {
      await tick()
      await document.fonts?.ready

      const { width, height } = EXPORT_SIZE[appSettings.exportRatio]
      const frameRect = this.phoneFrameRef.getBoundingClientRect()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        this.exportError = 'Failed to get canvas context'
        return
      }

      const cover = await loadImage(coverUrl)
      imageCache.set(coverUrl, cover)

      drawBlurredBackdrop(ctx, cover, width, height, appSettings.blurLevel)
      ctx.fillStyle = 'rgba(14, 14, 14, 0.35)'
      ctx.fillRect(0, 0, width, height)

      const captureScale = Math.round(height * EXPORT_FRAME_HEIGHT_RATIO) / frameRect.height
      const previousScrollTop = this.resultScreenRef.scrollTop
      this.resultScreenRef.scrollTop = 0
      await tick()

      const snapdom = await getSnapdom()
      let frameShot: HTMLCanvasElement
      try {
        frameShot = await snapdom.toCanvas(this.phoneFrameRef, {
          backgroundColor: 'transparent',
          scale: captureScale,
          dpr: 1,
          width: Math.round(frameRect.width),
          height: Math.round(frameRect.height),
          embedFonts: true,
        })
      } finally {
        this.resultScreenRef.scrollTop = previousScrollTop
      }

      ctx.drawImage(
        frameShot,
        Math.round((width - frameShot.width) / 2),
        Math.round((height - frameShot.height) / 2),
        frameShot.width,
        frameShot.height,
      )
      releaseCanvas(frameShot)

      if (appSettings.showCredit) {
        await drawExportCredit(
          ctx,
          width,
          height,
          appSettings.creditName,
          appSettings.avatarUrl,
          imageCache,
        )
      }
      imageCache.clear()

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      releaseCanvas(canvas)
      if (!blob) {
        this.exportError = 'Failed to generate image'
        return
      }

      await nextFrame()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.#fileName()
      link.click()
      URL.revokeObjectURL(url)

      if (import.meta.env.DEV) {
        console.log(`[export-image] ${Math.round(performance.now() - startedAt)}ms`)
      }
    } catch (err) {
      this.exportError = (err as Error).message || 'Export failed'
      console.error('[export-image] failed:', err)
    } finally {
      this.exportRenderMode = false
      this.exporting = false
    }
  }
}

export const imageExport = new ImageExport()
