'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(to: number, duration: number, go: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!go) return
    let raf: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(e * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [go, to, duration])
  return val
}

export default function HeroStats() {
  const [go, setGo] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const syncVal = useCountUp(3,   1400, go)
  const platVal = useCountUp(3,   1000, go)
  const upVal   = useCountUp(999, 1800, go)

  return (
    <div ref={ref} className="w-full pt-6 border-t border-white/[0.06]">
      <div className="flex items-stretch gap-0">

        {/* Stat 1 */}
        <div className="flex-1 pr-6">
          <p className="text-[38px] font-bold text-[#f0ece6] leading-none tabular-nums tracking-tight">
            <span className="text-[#c97a40] text-[28px] font-semibold">&lt;</span>{syncVal}
            <span className="text-[#c97a40] text-[22px] font-semibold">s</span>
          </p>
          <p className="text-[11px] font-medium text-[#4a4540] mt-2 tracking-wide uppercase">Avg sync time</p>
        </div>

        <div className="w-px bg-white/[0.07] self-stretch" />

        {/* Stat 2 */}
        <div className="flex-1 px-6">
          <p className="text-[38px] font-bold text-[#f0ece6] leading-none tabular-nums tracking-tight">
            {platVal}
          </p>
          <p className="text-[11px] font-medium text-[#4a4540] mt-2 tracking-wide uppercase">Platforms live</p>
        </div>

        <div className="w-px bg-white/[0.07] self-stretch" />

        {/* Stat 3 */}
        <div className="flex-1 pl-6">
          <p className="text-[38px] font-bold text-[#f0ece6] leading-none tabular-nums tracking-tight">
            {(upVal / 10).toFixed(1)}
            <span className="text-[#c97a40] text-[22px] font-semibold">%</span>
          </p>
          <p className="text-[11px] font-medium text-[#4a4540] mt-2 tracking-wide uppercase">Uptime</p>
        </div>

      </div>
    </div>
  )
}
