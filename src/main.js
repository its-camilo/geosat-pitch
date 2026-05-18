import './slides.js'
import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const scrollContainer  = document.querySelector('.scroll-container')
const horizontalWrapper = document.querySelector('.horizontal-wrapper')
const currentSection   = document.getElementById('currentSection')
const currentTitle     = document.getElementById('currentTitle')
const panels           = document.querySelectorAll('.slide.panel')

function syncViewportWidth() {
  document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`)
}

function getSlideCount() { return panels.length }

function getScrollDistancePx() {
  if (!horizontalWrapper) return 0
  return Math.max(0, horizontalWrapper.scrollWidth - window.innerWidth)
}

let pinScrollTrigger = null
let activeIdx = -1

// ── Stage cycling for panel 4 (index 3) ──────────────────────
let stageInterval = null
let currentStage  = 0

function startStageCycling() {
  const p4 = panels[3]
  if (!p4 || stageInterval) return
  currentStage = 0
  p4.dataset.stage = currentStage
  stageInterval = setInterval(() => {
    currentStage = (currentStage + 1) % 5
    p4.dataset.stage = currentStage
  }, 3000)
}

function stopStageCycling() {
  if (stageInterval) { clearInterval(stageInterval); stageInterval = null }
}

function activatePanel(idx) {
  if (idx === activeIdx) return
  if (activeIdx >= 0 && panels[activeIdx]) panels[activeIdx].classList.remove('panel-active')
  if (activeIdx === 3) stopStageCycling()
  activeIdx = idx
  if (panels[idx]) panels[idx].classList.add('panel-active')
  if (idx === 3) startStageCycling()
}

function updateChrome(idx, progress) {
  const progressBar = document.getElementById('progress-bar')
  if (progressBar) {
    const pct = Math.min(100, Math.max(0, progress * 100))
    progressBar.style.setProperty('--flag-reveal', `${pct.toFixed(2)}%`)
  }
  if (currentSection) currentSection.textContent = String(idx + 1).padStart(2, '0')
  const panel = panels[idx]
  if (currentTitle && panel) currentTitle.textContent = panel.dataset.title || ''
  activatePanel(idx)
}

function currentIdx(progress) {
  const n = getSlideCount()
  return n <= 1 ? 0 : Math.min(n - 1, Math.max(0, Math.round(progress * (n - 1))))
}

function initHorizontalScroll() {
  if (!scrollContainer || !horizontalWrapper) return
  const n = getSlideCount()
  if (n === 0) return

  const config = {
    trigger: scrollContainer,
    start: 'top top',
    end: () => `+=${getScrollDistancePx()}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => updateChrome(currentIdx(self.progress), self.progress),
  }

  if (n > 1) {
    config.snap = {
      snapTo: 1 / (n - 1),
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

// Keyboard navigation
window.addEventListener('keydown', e => {
  if (!pinScrollTrigger) return
  const n       = getSlideCount()
  const current = Math.round((pinScrollTrigger.progress ?? 0) * (n - 1))
  const max     = document.body.scrollHeight - window.innerHeight

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault()
    window.scrollTo({ top: (Math.min(n - 1, current + 1) / (n - 1)) * max, behavior: 'smooth' })
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    window.scrollTo({ top: (Math.max(0, current - 1) / (n - 1)) * max, behavior: 'smooth' })
  } else if (e.key === 'Home') {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (e.key === 'End') {
    e.preventDefault()
    window.scrollTo({ top: max, behavior: 'smooth' })
  }
})

syncViewportWidth()
initHorizontalScroll()

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
    // activate first panel immediately
    updateChrome(0, 0)
  })
})

window.addEventListener('load', () => {
  syncViewportWidth()
  ScrollTrigger.refresh()
  updateChrome(0, 0)
})
