import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { runSlideTitleTyping } from './typeTitle.js'

gsap.registerPlugin(ScrollTrigger)

const scrollContainer = document.querySelector('.scroll-container')
const horizontalWrapper = document.querySelector('.horizontal-wrapper')
const progressFill = document.getElementById('progressFill')
const currentSection = document.getElementById('currentSection')
const currentTitle = document.getElementById('currentTitle')
const dots = document.querySelectorAll('#dots button')
const panels = document.querySelectorAll('.slide.panel')

function syncViewportWidth() {
  document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`)
}

function getSlideCount() {
  return panels.length
}

function getScrollDistancePx() {
  if (!horizontalWrapper) return 0
  return Math.max(0, horizontalWrapper.scrollWidth - window.innerWidth)
}

let pinScrollTrigger = null
let lastTitleSlideIndex = null
let titleAnim = null

function updateChrome(idx, progress) {
  // progress bar
  if (progressFill) progressFill.style.width = (progress * 100).toFixed(2) + '%'

  // section counter + title
  if (currentSection) currentSection.textContent = String(idx + 1).padStart(2, '0')
  const panel = panels[idx]
  if (currentTitle && panel) currentTitle.textContent = panel.dataset.title || ''

  // dots
  dots.forEach((d, i) => d.classList.toggle('active', i === idx))
}

function syncActiveSlide() {
  if (!pinScrollTrigger) return
  const progress = pinScrollTrigger.progress ?? 0
  const n = getSlideCount()
  const idx = n <= 1 ? 0 : Math.min(n - 1, Math.max(0, Math.round(progress * (n - 1))))

  updateChrome(idx, progress)

  if (idx === lastTitleSlideIndex) return
  lastTitleSlideIndex = idx
  titleAnim?.cancel()

  const slide = panels[idx]
  const h1 = slide?.querySelector('[data-type-text]')
  if (!h1) return

  const runners = []
  runners.push(runSlideTitleTyping(h1, {
    typingSpeed: 55,
    initialDelay: 100,
    cursorBlinkDuration: 0.45,
    variableSpeed: { min: 30, max: 75 },
    showCursor: true,
  }))

  titleAnim = { cancel: () => runners.forEach(r => r.cancel()) }
}

function initHorizontalScroll() {
  if (!scrollContainer || !horizontalWrapper) return
  const slideCount = getSlideCount()
  if (slideCount === 0) return

  const config = {
    trigger: scrollContainer,
    start: 'top top',
    end: () => `+=${getScrollDistancePx()}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => updateChrome(
      Math.min(slideCount - 1, Math.max(0, Math.round(self.progress * (slideCount - 1)))),
      self.progress
    ),
  }

  if (slideCount > 1) {
    config.snap = {
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
    scrollTrigger: config,
  })

  pinScrollTrigger = tween.scrollTrigger ?? null
}

// Dot navigation
dots.forEach(d => {
  d.addEventListener('click', () => {
    const idx = parseInt(d.dataset.idx, 10)
    const n = getSlideCount()
    if (n <= 1) return
    const targetProgress = idx / (n - 1)
    const maxScroll = document.body.scrollHeight - window.innerHeight
    window.scrollTo({ top: targetProgress * maxScroll, behavior: 'smooth' })
  })
})

// Keyboard navigation
window.addEventListener('keydown', e => {
  if (!pinScrollTrigger) return
  const n = getSlideCount()
  const current = Math.round((pinScrollTrigger.progress ?? 0) * (n - 1))
  const maxScroll = document.body.scrollHeight - window.innerHeight

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault()
    const next = Math.min(n - 1, current + 1)
    window.scrollTo({ top: (next / (n - 1)) * maxScroll, behavior: 'smooth' })
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    const prev = Math.max(0, current - 1)
    window.scrollTo({ top: (prev / (n - 1)) * maxScroll, behavior: 'smooth' })
  } else if (e.key === 'Home') {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (e.key === 'End') {
    e.preventDefault()
    window.scrollTo({ top: maxScroll, behavior: 'smooth' })
  }
})

syncViewportWidth()
initHorizontalScroll()

ScrollTrigger.addEventListener('scrollEnd', syncActiveSlide)

let resizeRaf = 0
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    syncViewportWidth()
    ScrollTrigger.refresh()
  })
})

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    syncActiveSlide()
  })
})

window.addEventListener('load', () => {
  syncViewportWidth()
  ScrollTrigger.refresh()
  syncActiveSlide()
})
