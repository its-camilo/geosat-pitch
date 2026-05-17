import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { runSlideTitleTyping, runSlideSubtitleTyping } from './typeTitle.js'

gsap.registerPlugin(ScrollTrigger)

const scrollContainer = document.querySelector('.scroll-container')
const horizontalWrapper = document.querySelector('.horizontal-wrapper')

/** Evita el desfase 100vw vs ancho útil (franja a la derecha con scrollbar oculta). */
function syncViewportWidth() {
  document.documentElement.style.setProperty(
    '--viewport-width',
    `${window.innerWidth}px`,
  )
}

function getSlideCount() {
  return horizontalWrapper?.querySelectorAll('.slide').length ?? 0
}

/** Distancia horizontal a recorrer = ancho total del carril menos un viewport */
function getScrollDistancePx() {
  if (!horizontalWrapper) return 0
  return Math.max(0, horizontalWrapper.scrollWidth - window.innerWidth)
}

function getSlideIndexFromProgress(progress) {
  const n = getSlideCount()
  if (n <= 1) return 0
  const max = n - 1
  return Math.min(max, Math.max(0, Math.round(progress * max)))
}

let pinScrollTrigger = null
let lastTitleSlideIndex = null
let titleAnim = null

function syncActiveSlideTitle() {
  if (!pinScrollTrigger || !horizontalWrapper) return
  const idx = getSlideIndexFromProgress(pinScrollTrigger.progress)
  if (idx === lastTitleSlideIndex) return

  lastTitleSlideIndex = idx
  titleAnim?.cancel()

  const slides = horizontalWrapper.querySelectorAll('.slide')
  const slide = slides[idx]
  const h1 = slide?.querySelector('.slide-title[data-type-text]')
  const sub = slide?.querySelector('.slide-subtitle[data-type-text]')
  if (!h1 && !sub) return

  const typeOpts = {
    typingSpeed: 52,
    initialDelay: 80,
    cursorBlinkDuration: 0.48,
    variableSpeed: { min: 28, max: 72 },
    showCursor: true,
    hideCursorWhileTyping: false,
  }

  const runners = []
  if (h1) runners.push(runSlideTitleTyping(h1, typeOpts))
  if (sub) runners.push(runSlideSubtitleTyping(sub, typeOpts))

  titleAnim = {
    cancel: () => {
      for (const r of runners) r.cancel()
    },
  }
}

function initHorizontalScroll() {
  if (!scrollContainer || !horizontalWrapper) return

  const slideCount = getSlideCount()
  if (slideCount === 0) return

  const scrollTriggerConfig = {
    trigger: scrollContainer,
    start: 'top top',
    end: () => `+=${getScrollDistancePx()}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  }

  if (slideCount > 1) {
    scrollTriggerConfig.snap = {
      snapTo: 1 / (slideCount - 1),
      duration: { min: 0.13, max: 0.37 },
      delay: 0.04,
      ease: 'power2.inOut',
      inertia: false,
    }
  }

  const tween = gsap.to(horizontalWrapper, {
    x: () => -getScrollDistancePx(),
    ease: 'none',
    scrollTrigger: scrollTriggerConfig,
  })

  pinScrollTrigger = tween.scrollTrigger ?? null
}

syncViewportWidth()
initHorizontalScroll()

ScrollTrigger.addEventListener('scrollEnd', syncActiveSlideTitle)

function kickTitles() {
  ScrollTrigger.refresh()
  syncActiveSlideTitle()
}

requestAnimationFrame(() => {
  requestAnimationFrame(kickTitles)
})

window.addEventListener('load', () => {
  syncViewportWidth()
  kickTitles()
})

let resizeRaf = 0
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    syncViewportWidth()
    ScrollTrigger.refresh()
  })
})
