import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'

import { EquityChart } from '@/components/ui/finance-chart'
import { cn } from '@/lib/utils'

type Photo = {
  url: string
  text: string
  pos?: string
  by: string
}

export type GalleryItem =
  | {
      kind: 'image'
      /** Rota: `/trabalhos/:slug` */
      slug: string
      common: string
      binomial: string
      photo: Photo
      /** Página de detalhe com hero full-bleed (gradiente, nav, CTA). */
      heroLayout?: boolean
    }
  | {
      kind: 'chart'
      slug: string
      common: string
      binomial: string
      /** Rodapé do card (ex.: aviso sobre série). */
      credit?: string
      /** Qual componente de detalhe renderizar. Padrão: 'backtest'. */
      component?: 'backtest' | 'stock-prediction'
      /** Imagem opcional no card da galeria (substitui o gráfico de equity). */
      photo?: Photo
    }

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[]
  /** Distância dos cards ao centro (eixo Z). */
  radius?: number
  /** Velocidade da rotação automática quando não há scroll. */
  autoRotateSpeed?: number
}

function itemKey(item: GalleryItem, index: number) {
  return `${item.slug}-${index}`
}

function GalleryEquitySlot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth(Math.floor(w))
    })
    ro.observe(el)
    setWidth(Math.floor(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const h = 220

  return (
    <div
      ref={containerRef}
      className="bg-background min-h-0 w-full flex-1 overflow-hidden rounded-t-md"
    >
      {width > 10 ? (
        <EquityChart width={width} height={h} />
      ) : (
        <div
          className="bg-background w-full rounded-t-md"
          style={{ height: h }}
          aria-hidden
        />
      )}
    </div>
  )
}

function CardFooter({
  title,
  subtitle,
  credit,
}: {
  title: string
  subtitle: string
  credit: string
}) {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-10 text-white">
      <h2 className="text-lg font-bold leading-snug">{title}</h2>
      <em className="text-xs opacity-90 not-italic">{subtitle}</em>
      <p className="mt-1.5 text-[10px] leading-tight opacity-75">{credit}</p>
    </div>
  )
}

export const CircularGallery = forwardRef<
  HTMLDivElement,
  CircularGalleryProps
>(function CircularGallery(
  {
    items,
    className,
    radius = 600,
    autoRotateSpeed = 0.02,
    ...props
  },
  ref,
) {
  const [rotation, setRotation] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0
      const scrollRotation = scrollProgress * 360
      setRotation(scrollRotation)

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const autoRotate = () => {
      if (!isScrolling) {
        setRotation((prev) => prev + autoRotateSpeed)
      }
      animationFrameRef.current = requestAnimationFrame(autoRotate)
    }

    animationFrameRef.current = requestAnimationFrame(autoRotate)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isScrolling, autoRotateSpeed])

  const anglePerItem = 360 / items.length

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Galeria circular 3D"
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        className,
      )}
      style={{ perspective: '2000px' }}
      {...props}
    >
      <div
        className="relative h-full w-full"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {items.map((item, i) => {
          const itemAngle = i * anglePerItem
          const totalRotation = rotation % 360
          const relativeAngle = (itemAngle + totalRotation + 360) % 360
          const normalizedAngle = Math.abs(
            relativeAngle > 180 ? 360 - relativeAngle : relativeAngle,
          )
          const opacity = Math.max(0.3, 1 - normalizedAngle / 180)

          let body: ReactNode
          let footerCredit: string

          if (item.kind === 'chart' && item.photo) {
            body = (
              <img
                src={item.photo.url}
                alt={item.photo.text}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                style={{ objectPosition: item.photo.pos ?? 'center' }}
              />
            )
            footerCredit = `Foto: ${item.photo.by}`
          } else if (item.kind === 'chart') {
            body = (
              <div className="relative z-0 flex h-full w-full flex-col pt-2">
                <GalleryEquitySlot />
              </div>
            )
            footerCredit =
              item.credit ??
              'Curva ilustrativa (demo) — substitua pelo teu export real.'
          } else {
            body = (
              <img
                src={item.photo.url}
                alt={item.photo.text}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                style={{ objectPosition: item.photo.pos ?? 'center' }}
              />
            )
            footerCredit = `Foto: ${item.photo.by}`
          }

          return (
            <div
              key={itemKey(item, i)}
              role="group"
              aria-label={item.common}
              className="absolute h-[400px] w-[300px]"
              style={{
                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                left: '50%',
                top: '50%',
                marginLeft: '-150px',
                marginTop: '-200px',
                opacity,
                transition: 'opacity 0.3s linear',
              }}
            >
              <Link
                to={`/trabalhos/${item.slug}`}
                className="group relative block h-full w-full overflow-hidden rounded-lg border border-border bg-card/70 shadow-2xl backdrop-blur-lg outline-none ring-offset-background transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/50 dark:bg-card/30"
                aria-label={`Abrir trabalho: ${item.common}`}
              >
                {body}
                <CardFooter
                  title={item.common}
                  subtitle={item.binomial}
                  credit={footerCredit}
                />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
})

CircularGallery.displayName = 'CircularGallery'
