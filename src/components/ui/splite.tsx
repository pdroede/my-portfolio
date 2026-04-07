import type { Application } from '@splinetool/runtime'
import type { CSSProperties } from 'react'
import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export type SplineSceneProps = {
  scene: string
  className?: string
  /** Mesclado no wrapper interno; `overflow: visible` evita cortar o canvas nas bordas. */
  style?: CSSProperties
  /** Após o load; em câmera perspectiva, `setZoom(0.8)` costuma afastar e mostrar mais do modelo. */
  onLoad?: (app: Application) => void
}

export function SplineScene({
  scene,
  className,
  style,
  onLoad,
}: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-neutral-950/60">
          <span
            className="inline-block size-9 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent"
            aria-hidden
          />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        style={{ overflow: 'visible', ...style }}
        onLoad={onLoad}
      />
    </Suspense>
  )
}
