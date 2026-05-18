import { tick } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import { appSettings } from '$lib/stores/appSettings.svelte'
import type { ExportRatio } from '$lib/stores/appSettings.svelte'
import { albumParser } from './albumParser.svelte'

const EXPORT_FRAME_HEIGHT_RATIO = 0.9
const EXPORT_SIZE: Record<ExportRatio, { width: number; height: number }> = {
  '3:4': { width: 2400, height: 3200 },
  '9:16': { width: 1620, height: 2880 },
}

let snapdomLib: typeof import('@zumer/snapdom') | null = null

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load cover image'))
    img.src = src
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

async function drawExportCredit(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  name: string,
  avatarSrc: string,
  imageCache?: Map<string, HTMLImageElement>,
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
    let avatar = imageCache?.get(avatarSrc)
    if (!avatar) {
      avatar = await loadImage(avatarSrc)
      imageCache?.set(avatarSrc, avatar)
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
  if (!snapdomLib) {
    snapdomLib = await import('@zumer/snapdom')
  }
  return snapdomLib.snapdom
}

function createImageExport(getCoverUrl: () => string) {
  let phoneFrameRef = $state<HTMLElement | null>(null)
  let resultScreenRef = $state<HTMLElement | null>(null)
  let exporting = $state(false)
  let exportError = $state('')
  let exportRenderMode = $state(false)

  function getExportFileName(): string {
    const safeTitle =
      (albumParser.albumData?.title || 'album').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'album'
    return `${safeTitle}_${appSettings.exportRatio.replace(':', 'x')}.png`
  }

  async function generateAndDownloadImage() {
    if (!albumParser.albumData || !phoneFrameRef || !resultScreenRef || exporting) return
    exporting = true
    exportError = ''
    exportRenderMode = true
    const perfStart = performance.now()
    const stepDurations: Record<string, number> = {}
    const markStep = (name: string, start: number) => {
      stepDurations[name] = Number((performance.now() - start).toFixed(1))
    }
    const imageCache = new SvelteMap<string, HTMLImageElement>()
    const coverUrl = getCoverUrl()

    try {
      await tick()
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
      const { width, height } = EXPORT_SIZE[appSettings.exportRatio]
      const frameRect = phoneFrameRef.getBoundingClientRect()
      const resultRect = resultScreenRef.getBoundingClientRect()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        exportError = 'Failed to get canvas context'
        return
      }

      const loadCoverStart = performance.now()
      let cover = imageCache.get(coverUrl)
      if (!cover) {
        cover = await loadImage(coverUrl)
        imageCache.set(coverUrl, cover)
      }
      markStep('loadCover', loadCoverStart)

      const drawBgStart = performance.now()
      const scale = Math.max(width / cover.width, height / cover.height)
      const drawW = cover.width * scale
      const drawH = cover.height * scale
      const dx = (width - drawW) / 2
      const dy = (height - drawH) / 2

      ctx.save()
      ctx.filter = `blur(${appSettings.blurLevel}px)`
      ctx.drawImage(cover, dx, dy, drawW, drawH)
      ctx.restore()

      ctx.fillStyle = 'rgba(14, 14, 14, 0.35)'
      ctx.fillRect(0, 0, width, height)
      markStep('drawBg', drawBgStart)

      const desiredInnerHeight = Math.round(height * EXPORT_FRAME_HEIGHT_RATIO)
      const captureScale = desiredInnerHeight / frameRect.height

      const previousScrollTop = resultScreenRef.scrollTop
      resultScreenRef.scrollTop = 0
      await tick()

      const snapdom = await getSnapdom()
      const snapdomStart = performance.now()
      let frameShot: HTMLCanvasElement
      try {
        frameShot = await snapdom.toCanvas(phoneFrameRef, {
          backgroundColor: 'transparent',
          scale: captureScale,
          dpr: 1,
          width: Math.round(frameRect.width),
          height: Math.round(frameRect.height),
          embedFonts: true,
          iconFonts: [/Material Symbols/i],
        })
      } finally {
        resultScreenRef.scrollTop = previousScrollTop
      }
      markStep('snapdomCapture', snapdomStart)

      const drawFrameStart = performance.now()
      const frameWidth = frameShot.width
      const frameHeight = frameShot.height
      const frameX = Math.round((width - frameWidth) / 2)
      const frameY = Math.round((height - frameHeight) / 2)
      ctx.drawImage(frameShot, frameX, frameY, frameWidth, frameHeight)
      markStep('drawFrame', drawFrameStart)

      const drawCreditStart = performance.now()
      if (appSettings.showCredit) {
        await drawExportCredit(ctx, width, height, appSettings.creditName, appSettings.avatarUrl, imageCache)
      }
      markStep('drawCredit', drawCreditStart)
      frameShot.width = 0
      frameShot.height = 0
      imageCache.clear()

      const encodeStart = performance.now()
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1),
      )

      if (!blob) {
        exportError = 'Failed to generate image'
        return
      }
      markStep('encodePng', encodeStart)

      await nextFrame()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getExportFileName()
      link.click()
      URL.revokeObjectURL(url)

      if (import.meta.env.DEV) {
        const total = Number((performance.now() - perfStart).toFixed(1))
        console.groupCollapsed('[export-image] perf')
        console.log('params:', {
          ratio: appSettings.exportRatio,
          width,
          height,
          frameRect: { width: frameRect.width, height: frameRect.height },
          resultRect: { width: resultRect.width, height: resultRect.height },
          captureScale: Number(captureScale.toFixed(3)),
          blurLevel: appSettings.blurLevel,
        })
        console.table({ ...stepDurations, total })
        console.groupEnd()
      }
    } catch (err) {
      exportError = (err as Error).message || 'Export failed'
      console.error('[export-image] failed:', err)
    } finally {
      exportRenderMode = false
      exporting = false
    }
  }

  return {
    get phoneFrameRef() { return phoneFrameRef },
    set phoneFrameRef(v) { phoneFrameRef = v },
    get resultScreenRef() { return resultScreenRef },
    set resultScreenRef(v) { resultScreenRef = v },
    get exporting() { return exporting },
    get exportError() { return exportError },
    get exportRenderMode() { return exportRenderMode },
    generateAndDownloadImage,
  }
}

export const imageExport = createImageExport(() => albumParser.albumData?.cover_url ?? '')
