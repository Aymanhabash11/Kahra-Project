import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = -100, my = -100, rx = -100, ry = -100

    const moveCursor = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      const cursor = cursorRef.current
      if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px' }
    }

    function animRing() {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      const ring = ringRef.current
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px' }
      requestAnimationFrame(animRing)
    }

    const addHover = () => {
      document.querySelectorAll('a, button, .collection-card, .designer-item, .card').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorRef.current?.classList.add('hover')
          ringRef.current?.classList.add('hover')
        })
        el.addEventListener('mouseleave', () => {
          cursorRef.current?.classList.remove('hover')
          ringRef.current?.classList.remove('hover')
        })
      })
    }

    document.addEventListener('mousemove', moveCursor)
    animRing()
    addHover()

    const observer = new MutationObserver(addHover)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', moveCursor)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}
