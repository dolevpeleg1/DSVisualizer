import { useEffect, useRef } from 'react'

const GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>[]{}/=+*#$'

type Column = {
  x: number
  y: number
  speed: number
  length: number
  chars: string[]
}

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
}

function makeColumn(x: number, y: number): Column {
  const length = 8 + Math.floor(Math.random() * 18)
  return {
    x,
    y,
    speed: 0.35 + Math.random() * 0.85,
    length,
    chars: Array.from({ length }, randomGlyph),
  }
}

function createColumns(width: number, height: number, fontSize: number): Column[] {
  const count = Math.ceil(width / fontSize)
  return Array.from({ length: count }, (_, i) =>
    makeColumn(i * fontSize, Math.random() * height),
  )
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let columns: Column[] = []
    let frameId = 0
    let fontSize = 15
    let lastTime = 0

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement ?? canvas
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(clientWidth * dpr)
      canvas.height = Math.floor(clientHeight * dpr)
      canvas.style.width = `${clientWidth}px`
      canvas.style.height = `${clientHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fontSize = clientWidth < 640 ? 13 : 15
      columns = createColumns(clientWidth, clientHeight, fontSize)
    }

    const draw = (time: number) => {
      const { clientWidth: width, clientHeight: height } = canvas
      const dt = Math.min((time - lastTime) / 16.67, 2.5)
      lastTime = time

      ctx.fillStyle = '#040806'
      ctx.fillRect(0, 0, width, height)

      ctx.font = `${fontSize}px "IBM Plex Mono", ui-monospace, monospace`
      ctx.textBaseline = 'top'

      for (const col of columns) {
        col.y += col.speed * fontSize * 0.12 * dt

        if (col.y - col.length * fontSize > height) {
          const next = makeColumn(col.x, -Math.random() * fontSize * 8)
          col.y = next.y
          col.speed = next.speed
          col.length = next.length
          col.chars = next.chars
        }

        for (let i = 0; i < col.length; i++) {
          const charY = col.y - i * fontSize
          if (charY < -fontSize || charY > height) continue

          if (Math.random() < 0.012) {
            col.chars[i] = randomGlyph()
          }

          const head = i === 0
          const fade = 1 - i / col.length
          if (head) {
            ctx.fillStyle = 'rgba(220, 250, 230, 0.95)'
          } else {
            const alpha = 0.22 + fade * 0.5
            ctx.fillStyle = `rgba(130, 220, 155, ${alpha})`
          }
          ctx.fillText(col.chars[i]!, col.x, charY)
        }
      }

      frameId = requestAnimationFrame(draw)
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    resize()

    const paintStatic = () => {
      const { clientWidth: width, clientHeight: height } = canvas
      ctx.fillStyle = '#040806'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px "IBM Plex Mono", ui-monospace, monospace`
      ctx.textBaseline = 'top'
      for (const col of columns) {
        for (let i = 0; i < Math.min(col.length, 6); i++) {
          const fade = 1 - i / 6
          ctx.fillStyle = `rgba(130, 220, 155, ${0.2 + fade * 0.28})`
          ctx.fillText(col.chars[i]!, col.x, (col.y % height) - i * fontSize)
        }
      }
    }

    if (reducedMotion.matches) {
      paintStatic()
    } else {
      ctx.fillStyle = '#040806'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      lastTime = performance.now()
      frameId = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(() => {
      resize()
      if (reducedMotion.matches) paintStatic()
    })
    observer.observe(canvas.parentElement ?? canvas)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
