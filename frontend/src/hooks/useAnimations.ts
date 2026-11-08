import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-reveal hook using IntersectionObserver.
 * Respects prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number
  rootMargin?: string
}) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)
  const threshold = options?.threshold ?? 0.12
  const rootMargin = options?.rootMargin ?? '0px 0px -40px 0px'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, visible }
}

/**
 * Smooth number count-up / interpolation hook using requestAnimationFrame (easeOutQuart).
 * - If startFromZero is true, counts from 0 -> target on initial mount, and interpolates on subsequent changes.
 * - If startFromZero is false, starts at initial target and interpolates smoothly (e.g. 300ms) when target changes.
 */
export function useCountUp(
  target: number,
  duration = 850,
  delayMs = 0,
  startFromZero = true,
): number {
  const [value, setValue] = useState<number>(() => (startFromZero ? 0 : target))
  const currentRef = useRef<number>(startFromZero ? 0 : target)
  const firstRunRef = useRef<boolean>(true)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      currentRef.current = target
      setValue(target)
      return
    }

    const fromValue = firstRunRef.current && startFromZero ? 0 : currentRef.current
    const waitMs = firstRunRef.current ? delayMs : 0
    firstRunRef.current = false

    if (fromValue === target) {
      setValue(target)
      return
    }

    let rafId = 0
    let startTime: number | null = null

    const timerId = window.setTimeout(() => {
      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        // easeOutQuart: 1 - (1 - t)^4
        const eased = 1 - Math.pow(1 - progress, 4)
        const nextVal = fromValue + (target - fromValue) * eased
        currentRef.current = nextVal
        setValue(nextVal)

        if (progress < 1) {
          rafId = window.requestAnimationFrame(step)
        } else {
          currentRef.current = target
          setValue(target)
        }
      }

      rafId = window.requestAnimationFrame(step)
    }, waitMs)

    return () => {
      window.clearTimeout(timerId)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [target, duration, delayMs, startFromZero])

  return value
}

/**
 * Triggers a 0% -> target% fill transition on mount or whenever depKey changes.
 */
export function useAnimatedFill(depKey?: string | number, delayMs = 60): boolean {
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    setFilled(false)
    const timer = window.setTimeout(() => {
      setFilled(true)
    }, delayMs)
    return () => window.clearTimeout(timer)
  }, [depKey, delayMs])

  return filled
}

