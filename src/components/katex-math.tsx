import { useLayoutEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props = { math: string; className?: string }

/**
 * Direct KaTeX DOM render — avoids react-katex + Rolldown/minifier edge cases on production.
 */
export function KatexBlock({ math, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    try {
      katex.render(math, el, {
        displayMode: true,
        throwOnError: false,
        strict: 'ignore',
      })
    } catch {
      el.textContent = math
    }
    return () => {
      el.innerHTML = ''
    }
  }, [math])
  return <div ref={ref} className={className} />
}

export function KatexInline({ math, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    try {
      katex.render(math, el, {
        displayMode: false,
        throwOnError: false,
        strict: 'ignore',
      })
    } catch {
      el.textContent = math
    }
    return () => {
      el.innerHTML = ''
    }
  }, [math])
  return <span ref={ref} className={className} />
}
