import { useEffect, useRef } from 'react'

export default function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // Create snowflakes
    const flakes = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.8 + 0.3,
      wind: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }))

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const f of flakes) {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`
        ctx.fill()

        f.wobble += f.wobbleSpeed
        f.x += f.wind + Math.sin(f.wobble) * 0.3
        f.y += f.speed

        if (f.y > H + 5) {
          f.y = -5
          f.x = Math.random() * W
        }
        if (f.x > W + 5) f.x = -5
        if (f.x < -5) f.x = W + 5
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
