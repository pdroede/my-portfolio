import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { BacktestWorkPage } from '@/components/backtest-work-page'
import { StockPredictionWorkPage } from '@/components/stock-prediction-work-page'
import { Hero2 } from '@/components/ui/hero-2-1'
import { getWorkBySlug } from '@/data/gallery-works'

export function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const work = getWorkBySlug(slug)

  if (!work) {
    return (
      <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center px-6">
        <p className="text-muted-foreground">Trabalho não encontrado.</p>
        <Link
          to="/"
          className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao início
        </Link>
      </div>
    )
  }

  const showHeroDashboard =
    work.kind === 'image' && work.heroLayout === true

  return (
    <div className="bg-background text-foreground min-h-svh">
      {!showHeroDashboard && work.kind !== 'chart' ? (
        <header className="border-border border-b px-4 py-4 md:px-8">
          <Link
            to="/#trabalhos"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Trabalhos
          </Link>
        </header>
      ) : null}

      <main
        className={
          work.kind === 'chart'
            ? 'w-full min-h-svh p-0'
            : showHeroDashboard
              ? 'w-full px-0 py-0'
              : 'mx-auto max-w-3xl px-4 py-10 md:px-8'
        }
      >
        {showHeroDashboard ? (
          <>
            <Hero2
              title={work.common}
              description={work.binomial}
              badge="Detailed analytics · dashboards"
              heroImageSrc={work.photo.url}
              heroImageAlt={work.photo.text}
              primaryCtaLabel="Ver trabalhos"
              primaryCtaTo="/#trabalhos"
              secondaryCtaLabel="Início"
              secondaryCtaTo="/"
            />
            <div className="border-border/60 bg-background mx-auto max-w-3xl border-t px-4 py-8 text-center md:px-8">
              <p className="text-muted-foreground text-xs">
                Foto: {work.photo.by}
              </p>
            </div>
          </>
        ) : null}

        {work.kind === 'chart' && work.component === 'stock-prediction' ? (
          <StockPredictionWorkPage
            headline={work.common}
            subheadline={work.binomial}
            footerCredit={work.credit}
          />
        ) : work.kind === 'chart' ? (
          <BacktestWorkPage
            headline={work.common}
            subheadline={work.binomial}
            footerCredit={work.credit}
          />
        ) : !showHeroDashboard ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {work.common}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{work.binomial}</p>
            <div className="mt-10 space-y-4">
              <div className="border-border overflow-hidden rounded-xl border">
                <img
                  src={work.photo.url}
                  alt={work.photo.text}
                  className="aspect-video w-full object-cover"
                  style={{ objectPosition: work.photo.pos ?? 'center' }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Foto: {work.photo.by}
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
