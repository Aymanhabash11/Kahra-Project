import { useEffect, useRef } from 'react'

export function useReveal() {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 },
    )

    const root = containerRef.current ?? document
    root.querySelectorAll('.reveal').forEach(el => obs.observe(el))

    return () => obs.disconnect()
  }, [])

  return containerRef
}
