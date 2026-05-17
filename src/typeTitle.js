import gsap from 'gsap'

const defaults = {
  typingSpeed: 55,
  initialDelay: 0,
  variableSpeed: null,
  showCursor: true,
  hideCursorWhileTyping: false,
  cursorBlinkDuration: 0.45,
  textSelector: '.slide-title__text',
  cursorSelector: '.slide-title__cursor',
  cursorHiddenClass: 'slide-title__cursor--hidden',
}

/**
 * Efecto tipo TextType (React Bits) en vanilla: escribe el texto una vez.
 * @param {HTMLElement} rootEl — `data-type-text` + spans según selectores
 * @returns {{ cancel: () => void }}
 */
export function runTypeWriter(rootEl, options = {}) {
  const opts = { ...defaults, ...options }
  const fullText = rootEl.getAttribute('data-type-text') ?? ''
  const textEl = rootEl.querySelector(opts.textSelector)
  const cursorEl = rootEl.querySelector(opts.cursorSelector)
  const hiddenClass = opts.cursorHiddenClass

  let cancelled = false
  let timeoutId = null
  let charIndex = 0
  let cursorBlink = null

  function clearTimers() {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function stopCursorBlink() {
    if (cursorBlink) {
      cursorBlink.kill()
      cursorBlink = null
    }
    if (cursorEl) gsap.set(cursorEl, { clearProps: 'opacity' })
  }

  function startCursorBlink() {
    if (!opts.showCursor || !cursorEl) return
    stopCursorBlink()
    gsap.set(cursorEl, { opacity: 1 })
    cursorEl.classList.remove(hiddenClass)
    cursorBlink = gsap.to(cursorEl, {
      opacity: 0,
      duration: opts.cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    })
  }

  function schedule(fn, delay) {
    clearTimers()
    if (cancelled) return
    timeoutId = window.setTimeout(fn, delay)
  }

  function charDelay() {
    if (opts.variableSpeed != null) {
      const { min, max } = opts.variableSpeed
      return min + Math.random() * (max - min)
    }
    return opts.typingSpeed
  }

  function typeStep() {
    if (cancelled) return
    if (!textEl) return
    if (charIndex >= fullText.length) {
      textEl.textContent = fullText
      startCursorBlink()
      return
    }
    textEl.textContent += fullText.charAt(charIndex)
    charIndex += 1
    schedule(typeStep, charDelay())
  }

  function cancel() {
    cancelled = true
    clearTimers()
    stopCursorBlink()
    if (textEl) textEl.textContent = ''
    if (cursorEl) cursorEl.classList.add(hiddenClass)
  }

  if (!textEl) {
    return { cancel: () => {} }
  }

  if (!fullText) {
    textEl.textContent = ''
    return { cancel: () => {} }
  }

  textEl.textContent = ''
  charIndex = 0

  if (opts.showCursor && cursorEl) {
    if (opts.hideCursorWhileTyping) {
      cursorEl.classList.add(hiddenClass)
    } else {
      startCursorBlink()
    }
  }

  schedule(() => {
    if (cancelled) return
    if (opts.hideCursorWhileTyping && opts.showCursor && cursorEl) {
      cursorEl.classList.remove(hiddenClass)
      startCursorBlink()
    }
    typeStep()
  }, opts.initialDelay)

  return { cancel }
}

export function runSlideTitleTyping(el, options = {}) {
  return runTypeWriter(el, {
    textSelector: '.slide-title__text',
    cursorSelector: '.slide-title__cursor',
    cursorHiddenClass: 'slide-title__cursor--hidden',
    ...options,
  })
}

export function runSlideSubtitleTyping(el, options = {}) {
  return runTypeWriter(el, {
    textSelector: '.slide-subtitle__text',
    cursorSelector: '.slide-subtitle__cursor',
    cursorHiddenClass: 'slide-subtitle__cursor--hidden',
    ...options,
  })
}
