'use client'

import { useScrollProgress } from '@/lib/useScrollProgress'

export default function ScrollFlyHint() {
  const { progress } = useScrollProgress()
  const visible = progress < 0.08

  return (
    <div
      className={`scroll-fly-hint${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
    >
      <span className="scroll-fly-hint__chevron" />
      Scroll up to fly
    </div>
  )
}
