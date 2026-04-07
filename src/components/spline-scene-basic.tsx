import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'
import { frameHeroRobot } from '@/lib/spline-hero-camera'

function scrollToWorks() {
  document.getElementById('trabalhos')?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Hero integrado ao fundo do site: preto #000 + listra (Spotlight) como antes.
 */
export function SplineSceneBasic() {
  return (
    <section className="relative w-full bg-background text-neutral-100">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      <div className="relative z-10 flex min-h-[min(680px,100svh)] w-full flex-col md:min-h-[min(820px,100svh)] md:flex-row md:items-stretch">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 md:px-10 lg:px-14 xl:pl-[max(2rem,calc((100vw-80rem)/2+1.5rem))]">
          <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-[0.25em] mb-5">
            São Paulo, Brasil
          </p>
          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl lg:text-7xl leading-none tracking-tight">
            Pedro Ede
          </h1>
          <p className="mt-5 max-w-sm text-neutral-400 text-base leading-relaxed" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Curioso por natureza, autodidata por escolha. Encontrei nos mercados
            financeiros o lugar perfeito onde matemática, código e incerteza
            coexistem — e nunca mais parei de estudar.
          </p>
          <button
            type="button"
            onClick={scrollToWorks}
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-neutral-100"
          >
            Ver trabalhos
            <span aria-hidden className="text-neutral-500">↓</span>
          </button>
        </div>

        <div className="relative z-10 min-h-[min(440px,62svh)] w-full flex-1 md:min-h-[min(820px,92svh)]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full min-h-[min(440px,62svh)] w-full md:min-h-[min(820px,92svh)]"
            onLoad={(app) => {
              frameHeroRobot(app)
              requestAnimationFrame(() => frameHeroRobot(app))
              setTimeout(() => frameHeroRobot(app), 200)
            }}
          />
        </div>
      </div>
    </section>
  )
}
