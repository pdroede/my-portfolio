import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { ParentSize } from '@visx/responsive'
import { InlineMath, BlockMath } from 'react-katex'

import { EquityChart, type EquityPoint } from '@/components/ui/finance-chart'
import { fmtPct, fmtRatio } from '@/components/backtest-report-ui'
import { cn } from '@/lib/utils'
import {
  STRATEGY_INDEX_LABELS,
  STRATEGY_INDEX_ORDER,
  type StrategyIndexKey,
} from '@/data/strategy-equity'
import { useStrategyBacktestBundles } from '@/hooks/use-strategy-backtest-bundles'
import type { StrategyMonthlyPoint } from '@/lib/strategy-backtest-series'
import { bt } from '@/lib/katex-strings'

/* ─── TOC sections ──────────────────────────────────────────────────── */

const TOC_SECTIONS = [
  { id: 's-abstract',     n: '1', label: 'Abstract' },
  { id: 's-intro',        n: '2', label: 'Introdução' },
  { id: 's-framework',    n: '3', label: 'Definições Formais' },
  { id: 's-pipeline',     n: '4', label: 'Dados e Pipeline' },
  { id: 's-results',      n: '5', label: 'Resultados' },
  { id: 's-overfitting',  n: '6', label: 'Overfitting' },
  { id: 's-limitations',  n: '7', label: 'Limitações' },
  { id: 's-final',        n: '8', label: 'Considerações Finais' },
]

/* ─── active section hook ───────────────────────────────────────────── */

function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-15% 0px -75% 0px' },
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [ids])
  return active
}

/* ─── reveal animation ──────────────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── typography ────────────────────────────────────────────────────── */

const SERIF = "'EB Garamond', Georgia, 'Times New Roman', serif"

function ArticleProse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      style={{ fontFamily: SERIF }}
      className={cn(
        'text-zinc-300 text-[1.0625rem] leading-[1.9] tracking-[0.01em]',
        /* KaTeX breaks if letter-spacing inherits from prose */
        '[&_.katex]:tracking-normal',
        '[&_strong]:text-zinc-100 [&_strong]:font-semibold',
        '[&_em]:italic [&_em]:text-zinc-300',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SectionHeader({ n, title, id }: { n: string; title: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-20 pt-2">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[10px] text-zinc-600 tracking-[0.2em] select-none shrink-0">§{n}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      <h2 style={{ fontFamily: SERIF }} className="text-2xl font-medium text-zinc-100 tracking-tight italic">
        {title}
      </h2>
    </div>
  )
}

function Divider() {
  return <div className="my-16 flex items-center gap-4">
    <div className="flex-1 h-px bg-zinc-800/60" />
    <span className="text-zinc-700 text-[10px] font-mono tracking-widest">· · ·</span>
    <div className="flex-1 h-px bg-zinc-800/60" />
  </div>
}

/* ─── definition box ────────────────────────────────────────────────── */

function Definition({
  id,
  name,
  formula,
  description,
}: {
  id: string
  name: string
  formula: string
  description: string
}) {
  return (
    <div className="my-7 rounded-r-xl border-l-[3px] border-violet-500/50 bg-zinc-900/50 py-5 pl-6 pr-5">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em]">Def. {id}</span>
        <span className="text-zinc-400 text-sm" style={{ fontFamily: SERIF }}>{name}</span>
      </div>
      <div className="overflow-x-auto py-2 text-zinc-200">
        <BlockMath math={formula} />
      </div>
      <p className="text-zinc-500 text-xs leading-relaxed mt-2" style={{ fontFamily: SERIF }}>{description}</p>
    </div>
  )
}

/* ─── figure wrapper ────────────────────────────────────────────────── */

function Figure({
  n,
  caption,
  children,
}: {
  n: string
  caption: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <figure className="my-8">
      {children}
      <figcaption className="mt-3 flex items-start gap-2">
        <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest shrink-0 mt-0.5">Fig. {n}</span>
        <span className="text-zinc-500 text-xs leading-relaxed" style={{ fontFamily: SERIF }}>{caption}</span>
      </figcaption>
    </figure>
  )
}

/* ─── drawdown chart ────────────────────────────────────────────────── */

function DrawdownChart({ monthly }: { monthly: StrategyMonthlyPoint[] }) {
  const data = monthly.map((m) => m.drawdownPct)
  if (data.length < 2) return null
  const W = 1000, H = 100
  const maxVal = Math.max(...data, 1)
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    (v / maxVal) * H,
  ])
  const area = `M0,0 ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${W},0 Z`
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: 72, display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id="dd-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.03} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dd-grad)" />
      <polyline points={line} fill="none" stroke="#f87171" strokeWidth={2} />
    </svg>
  )
}

/* ─── metric card ───────────────────────────────────────────────────── */

function MetricCard({ symbol, label, value, delay }: { symbol: string; label: string; value: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="border-zinc-800/60 bg-zinc-900/30 rounded-xl border p-5">
        <div className="text-zinc-600 font-mono text-xs overflow-x-auto mb-3">
          <InlineMath math={symbol} />
        </div>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">{label}</p>
        <p className="text-zinc-50 text-3xl font-semibold tabular-nums tracking-tight mt-1" style={{ fontFamily: SERIF }}>
          {value}
        </p>
      </div>
    </Reveal>
  )
}

/* ─── TOC sidebar ───────────────────────────────────────────────────── */

function TableOfContents({ active }: { active: string }) {
  return (
    <nav className="space-y-0.5">
      <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.2em] mb-4 px-2">
        Conteúdo
      </p>
      {TOC_SECTIONS.map(({ id, n, label }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={cn(
              'flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
              isActive
                ? 'text-zinc-200 bg-zinc-800/60'
                : 'text-zinc-600 hover:text-zinc-400',
            )}
          >
            <span className="font-mono text-[9px] shrink-0 tabular-nums">{n}</span>
            <span style={{ fontFamily: SERIF }} className="leading-snug">{label}</span>
          </a>
        )
      })}
    </nav>
  )
}

/* ─── main ───────────────────────────────────────────────────────────── */

export function BacktestWorkPage({
  headline,
  subheadline,
  footerCredit,
}: {
  headline: string
  subheadline: string
  footerCredit?: string
}) {
  const [index, setIndex] = useState<StrategyIndexKey>('sp500')
  const load = useStrategyBacktestBundles()
  const bundle = load.status === 'ready' ? load.byIndex[index] : null
  const activeSection = useActiveSection(TOC_SECTIONS.map((s) => s.id))

  const primarySeries = useMemo<EquityPoint[] | undefined>(() => {
    if (!bundle?.monthly.length) return undefined
    return bundle.monthly.map((m) => ({ date: `${m.month}-01T12:00:00.000Z`, close: m.equity }))
  }, [bundle])

  const secondarySeries = useMemo<EquityPoint[] | undefined>(() => {
    if (!bundle?.monthly.length) return undefined
    return bundle.monthly.map((m) => ({ date: `${m.month}-01T12:00:00.000Z`, close: m.bhEquity }))
  }, [bundle])

  const s = bundle?.compoundSummary

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-svh w-full">

      {/* ── running header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-6 flex items-center justify-between gap-4 py-3">
          <Link
            to="/#trabalhos"
            className="text-zinc-500 hover:text-zinc-200 inline-flex items-center gap-2 text-sm transition-colors shrink-0"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Trabalhos</span>
          </Link>
          <p
            className="text-zinc-500 text-xs truncate hidden md:block"
            style={{ fontFamily: SERIF }}
          >
            {headline}
          </p>
          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest shrink-0 hidden sm:block">
            Working paper
          </span>
        </div>
      </header>

      {/* ── page body ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 flex gap-12 xl:gap-16">

        {/* TOC — desktop only */}
        <aside className="hidden xl:block w-44 shrink-0">
          <div className="sticky top-20 pt-20">
            <TableOfContents active={activeSection} />
          </div>
        </aside>

        {/* article */}
        <article className="min-w-0 flex-1 max-w-[700px] pb-32">

          {/* ── article header ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pt-16 pb-10 border-b border-zinc-800"
          >
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.25em] mb-5">
              Working paper &middot; quantitative research
            </p>
            <h1
              style={{ fontFamily: SERIF }}
              className="text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-zinc-50 italic"
            >
              {headline}
            </h1>
            <p
              style={{ fontFamily: SERIF }}
              className="mt-5 text-zinc-400 text-lg leading-relaxed"
            >
              {subheadline}
            </p>

            {/* metadata */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              {[
                { label: 'Instrumentos', value: 'MES · MNQ (futuros micro)' },
                { label: 'Motor', value: 'Python · pandas · numpy' },
                { label: 'Interface', value: 'Streamlit · Jupyter' },
                { label: 'Execução', value: 'Interactive Brokers API' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">{label}</span>
                  <span className="text-zinc-400 text-xs" style={{ fontFamily: SERIF }}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── §1 ABSTRACT ─────────────────────────────────────── */}
          <section id="s-abstract" className="scroll-mt-20 mt-14">
            <Reveal>
              <SectionHeader n="1" title="Abstract" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6 border border-zinc-800/60 bg-zinc-900/30 rounded-xl p-7">
                <ArticleProse className="space-y-4">
                  <p>
                    Este trabalho descreve a construção de um pipeline de pesquisa quantitativa para trading sistemático intradiário em contratos futuros sobre os índices S&amp;P 500 e NASDAQ. A abordagem parte de dados históricos de alta frequência, aplica uma regra de decisão codificada — sem intervenção discricionária — e gera um registro auditável de operações. Esse registro é submetido a uma camada de métricas estatísticas que inclui retorno ajustado ao risco, análise de cauda da distribuição de P&amp;L, simulação de incerteza via bootstrap e Monte Carlo, e comparação contra o benchmark <em>buy-and-hold</em> no mesmo instrumento.
                  </p>
                  <p>
                    A contribuição central não é uma estratégia lucrativa divulgada, mas a metodologia: um pipeline auditável de ponta a ponta, com separação explícita entre motor de simulação, módulo de métricas e interface de análise, garantindo rastreabilidade dos números do backtest até o dashboard.
                  </p>
                </ArticleProse>
              </div>
            </Reveal>
          </section>

          <Divider />

          {/* ── §2 INTRODUÇÃO ───────────────────────────────────── */}
          <section id="s-intro" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="2" title="Introdução e Motivação" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-5">
                <p>
                  O ponto de partida é uma crítica metodológica comum em trading sistemático: a maioria das análises apresenta um único número — o lucro total — sem contextualizar risco, custo, regime de mercado ou incerteza amostral. Um backtest com retorno de 80% pode esconder um drawdown de 60% e um Sharpe próximo de zero.
                </p>
                <p>
                  A pergunta que guia o projeto não é <em>"a estratégia é lucrativa?"</em>, mas <em>"dado o histórico observado, qual é a distribuição dos resultados possíveis, e o que os dados permitem afirmar com razoável confiança?"</em>. Isso exige uma infraestrutura de análise, não apenas uma planilha de PnL.
                </p>
                <p>
                  O objetivo é ter uma <strong>linha de trabalho única e auditável</strong>: mesmos pressupostos de dados, P&amp;L e custos do backtest até o dashboard — ir além de um único número e medir retorno ajustado ao risco, cauda da distribuição, drawdowns e incerteza; deixar claro o que é resultado da amostra histórica e o que é robustez.
                </p>
              </ArticleProse>
            </Reveal>
          </section>

          <Divider />

          {/* ── §3 FRAMEWORK ────────────────────────────────────── */}
          <section id="s-framework" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="3" title="Framework e Definições Formais" id="" />
            </Reveal>
            <Reveal delay={0.07}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  Seja <InlineMath math={bt.rSeq} /> a sequência de retornos de cada operação (em dólares), onde <InlineMath math={"N"} /> é o número total de trades. O capital composto no instante <InlineMath math={"t"} /> é dado por:
                </p>
              </ArticleProse>
            </Reveal>

            <Reveal delay={0.1}>
              <Definition
                id="3.1"
                name="Capital Composto"
                formula={bt.def31}
                description="onde V₀ é o capital inicial, cᵢ é o número de contratos na operação i (proporcional a Vᵢ₋₁ / V₀), e φᵢ é a comissão paga na operação i. O número de contratos cresce com o capital — reinvestimento completo."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>O <strong>Drawdown</strong> no instante <InlineMath math={"t"} /> mede a queda percentual em relação ao máximo histórico acumulado:</p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.2"
                name="Drawdown e Maximum Drawdown"
                formula={bt.def32}
                description="MDD representa o pior momento desde o pico histórico. É uma métrica de risco de cauda — não de dispersão — e não é capturada pelo desvio-padrão."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>O <strong>CAGR</strong> annualiza o retorno total considerando o efeito do capital composto ao longo do período <InlineMath math={"T"} /> (em anos):</p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.3"
                name="CAGR — Crescimento Anualizado"
                formula={bt.def33}
                description="Equivalente à taxa de juros composta que produziria o mesmo crescimento de V₀ até V_T em T anos. Sensível a valores extremos no início ou no fim da série."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>O <strong>Índice de Sharpe</strong> anualizado, convenção trade-based com frequência de operações <InlineMath math={"f = N/T"} />:</p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.4"
                name="Sharpe Ratio (anualizado)"
                formula={bt.def34}
                description="r̄ é o retorno médio por trade, σ̂_r é o desvio-padrão amostral, e f é a frequência anualizada de trades. Penaliza igualmente ganhos e perdas — limitação quando a distribuição é assimétrica."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>O <strong>Índice de Sortino</strong> substitui o desvio-padrão total pelo <em>downside deviation</em>:</p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.5"
                name="Sortino Ratio (anualizado)"
                formula={bt.def35}
                description="σ_d é o downside deviation: raiz quadrada da média dos quadrados dos retornos negativos. Trades vencedores não aumentam σ_d, ao contrário do que ocorre com σ̂_r no Sharpe."
              />
            </Reveal>
          </section>

          <Divider />

          {/* ── §4 PIPELINE ─────────────────────────────────────── */}
          <section id="s-pipeline" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="4" title="Dados e Pipeline de Processamento" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  Os dados históricos são obtidos em resolução de minuto de um provedor institucional (Databento), cobrindo MES (S&amp;P 500 micro, <InlineMath math={bt.mes5} />) e MNQ (NASDAQ micro, <InlineMath math={bt.mnq2} />). A cadeia de processamento segue quatro etapas com entradas e saídas explícitas:
                </p>
              </ArticleProse>
            </Reveal>

            <div className="mt-8 space-y-3">
              {[
                {
                  n: '4.1', title: 'Ingestão e Agregação',
                  body: <>Dados brutos minuto a minuto agregados para o timeframe de simulação. Cada barra gera um registro com campos <InlineMath math={bt.pipe41} />. Rolls de contrato tratados com ajuste retroativo.</>,
                },
                {
                  n: '4.2', title: 'Motor de Simulação',
                  body: <>Regra de decisão codificada em Python sem parâmetros ajustados post-hoc. O motor registra entrada <InlineMath math={bt.pipe42a} />, saída <InlineMath math={bt.pipe42b} /> e P&amp;L em pontos. O CSV exportado permite recalcular qualquer métrica independentemente.</>,
                },
                {
                  n: '4.3', title: 'Conversão de PnL e Custos',
                  body: <>P&amp;L bruto: <InlineMath math={bt.pipe43a} />. Comissão round-trip: <InlineMath math={bt.pipe43b} /> por micro-contrato. Líquido: <InlineMath math={bt.pipe43c} />, aplicado em camada única antes de qualquer métrica.</>,
                },
                {
                  n: '4.4', title: 'Análise de Incerteza',
                  body: <>Bootstrap com reposição sobre <InlineMath math={bt.pipe44a} /> gerando <InlineMath math={bt.pipe44b} /> réplicas, e Monte Carlo parametrizado por <InlineMath math={bt.pipe44c} /> estimados da amostra. As distribuições de MDD e equity terminal descrevem o cone de incerteza ao redor da curva histórica.</>,
                },
              ].map(({ n, title, body }, i) => (
                <Reveal key={n} delay={i * 0.06}>
                  <div className="border-zinc-800/40 bg-zinc-900/20 rounded-xl border p-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-[9px] text-zinc-600 tracking-widest">§{n}</span>
                      <p className="text-zinc-200 text-sm font-medium" style={{ fontFamily: SERIF }}>{title}</p>
                    </div>
                    <ArticleProse><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── §5 RESULTADOS ───────────────────────────────────── */}
          <section id="s-results" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="5" title="Resultados Empíricos" id="" />
            </Reveal>
            <Reveal delay={0.06}>
              <ArticleProse className="mt-6">
                <p>
                  As curvas abaixo mostram a evolução do capital composto <InlineMath math={"V_t"} /> (linha contínua) contra o benchmark <em>buy-and-hold</em> <InlineMath math={bt.vtBh} /> (linha tracejada), partindo de <InlineMath math={bt.v0k} />.
                </p>
              </ArticleProse>
            </Reveal>

            {/* tab switcher */}
            <Reveal delay={0.08} className="mt-6 flex items-center gap-4">
              <div className="bg-zinc-900/60 inline-flex gap-0.5 rounded-xl p-1" role="tablist">
                {STRATEGY_INDEX_ORDER.map((key) => {
                  const selected = index === key
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setIndex(key)}
                      className={cn(
                        'relative min-h-8 rounded-lg px-4 py-1.5 text-sm outline-none transition-colors',
                        selected ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300',
                      )}
                      style={{ fontFamily: SERIF }}
                    >
                      {selected ? (
                        <motion.span
                          layoutId="bwp-tab"
                          className="bg-zinc-800 absolute inset-0 -z-10 rounded-lg"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      ) : null}
                      <span className="relative z-10">{STRATEGY_INDEX_LABELS[key]}</span>
                    </button>
                  )
                })}
              </div>
              <span className="font-mono text-[9px] text-zinc-600 hidden sm:block">
                base <InlineMath math={bt.v0k} />
              </span>
            </Reveal>

            {/* equity chart */}
            <Reveal delay={0.1}>
              <Figure
                n="1"
                caption={<><InlineMath math={"V_t"} /> (estratégia, linha contínua) vs. <InlineMath math={bt.vtBh} /> (buy &amp; hold, linha tracejada). Capital composto, série mensal.</>}
              >
                <div className="border-zinc-800 bg-zinc-900/20 rounded-2xl border overflow-hidden p-4 pb-2">
                  {load.status === 'loading' && (
                    <div className="flex h-56 items-center justify-center">
                      <span className="text-zinc-600 text-sm font-mono">carregando série…</span>
                    </div>
                  )}
                  {load.status === 'error' && (
                    <div className="flex h-56 items-center justify-center">
                      <span className="text-red-400 text-sm">{load.message}</span>
                    </div>
                  )}
                  {load.status === 'ready' && bundle && primarySeries && secondarySeries && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{ height: 300 }}
                    >
                      <ParentSize debounceTime={10}>
                        {({ width, height }) =>
                          width > 8 && height > 8 ? (
                            <EquityChart data={primarySeries} height={height} secondaryData={secondarySeries} variant="page" width={width} />
                          ) : null
                        }
                      </ParentSize>
                    </motion.div>
                  )}
                  <div className="flex gap-5 pt-2 pb-1 px-1">
                    <span className="flex items-center gap-2 text-[11px] text-zinc-500" style={{ fontFamily: SERIF }}>
                      <span className="inline-block w-5 h-0.5 bg-emerald-400 rounded" />
                      Estratégia — <InlineMath math={"V_t"} />
                    </span>
                    <span className="flex items-center gap-2 text-[11px] text-zinc-500" style={{ fontFamily: SERIF }}>
                      <span className="inline-block w-5 border-t-2 border-dashed border-sky-400 rounded" />
                      Buy &amp; Hold — <InlineMath math={bt.vtBh} />
                    </span>
                  </div>
                </div>
              </Figure>
            </Reveal>

            {/* drawdown */}
            {bundle?.monthly.length ? (
              <Reveal delay={0.12}>
                <Figure
                  n="2"
                  caption={<><InlineMath math={bt.ddCaption} /> — drawdown percentual vs. pico, série mensal.</>}
                >
                  <div className="border-zinc-800 bg-zinc-900/20 rounded-2xl border overflow-hidden px-4 pt-4 pb-1">
                    <DrawdownChart monthly={bundle.monthly} />
                  </div>
                </Figure>
              </Reveal>
            ) : null}

            {/* metrics */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {s ? (
                <>
                  <MetricCard delay={0} symbol={bt.metricCagr} label="Crescimento anualizado" value={fmtPct(s.cagr * 100)} />
                  <MetricCard delay={0.07} symbol={bt.metricS} label="Sharpe (anualizado)" value={fmtRatio(s.sharpeAnnualizedExcel)} />
                  <MetricCard delay={0.14} symbol={bt.metricD} label="Sortino (anualizado)" value={fmtRatio(s.sortinoAnnualizedExcel)} />
                </>
              ) : (
                <div className="sm:col-span-3 text-zinc-600 text-sm font-mono py-4">
                  {load.status === 'loading' ? 'computando…' : '—'}
                </div>
              )}
            </div>

            {s ? (
              <Reveal delay={0.1} className="mt-4">
                <div className="border-zinc-800/40 rounded-xl border px-5 py-3">
                  <p className="text-zinc-600 text-xs font-mono leading-loose">
                    MDD = <span className="text-zinc-400">{fmtPct(s.drawdownPctPeak)}</span>
                    {' '}·{' '}N = <span className="text-zinc-400">{s.totalTrades}</span>
                    {' '}·{' '}T ≈ <span className="text-zinc-400">{s.years.toFixed(1)}</span> a
                    {' '}·{' '}WR = <span className="text-zinc-400">{fmtPct(s.winRatePct)}</span>
                    {' '}·{' '}PF = <span className="text-zinc-400">{fmtRatio(s.profitFactor)}</span>
                    {' '}·{' '}fees = <span className="text-zinc-400">{s.totalFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </p>
                </div>
              </Reveal>
            ) : null}
          </section>

          <Divider />

          {/* ── §6 OVERFITTING ──────────────────────────────────── */}
          <section id="s-overfitting" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="6" title="Análise de Overfitting e Robustez" id="" />
            </Reveal>
            <Reveal delay={0.06}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  Overfitting — ou data-snooping bias — ocorre quando um modelo captura ruído amostral em vez de sinal genuíno, gerando desempenho in-sample inflado que não se sustenta fora da amostra. Esta seção aplica critérios formais para avaliar a plausibilidade estatística dos resultados apresentados em §5.
                </p>
              </ArticleProse>
            </Reveal>

            {/* 6.1 */}
            <Reveal delay={0.07} className="mt-8">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-5">§6.1 — Evidências contra overfitting</p>
            </Reveal>
            <div className="space-y-3">
              {[
                {
                  label: 'Poder estatístico da amostra',
                  body: <>Com <InlineMath math={bt.o61a} /> e <InlineMath math={bt.o61b} /> operações, o erro-padrão do win rate estimado é <InlineMath math={bt.o61c} />. Um intervalo de 95% de confiança tem largura <InlineMath math={bt.o61d} /> — estreito o suficiente para que as diferenças observadas sejam estatisticamente distinguíveis de ruído.</>,
                },
                {
                  label: 'Parcimônia paramétrica',
                  body: 'A regra de decisão opera com graus de liberdade mínimos. Poucas escolhas estruturais reduzem drasticamente o espaço de busca implícito; em amostras de 4k+ trades, mesmo uma varredura exaustiva dentro desse espaço teria impacto estatístico marginal.',
                },
                {
                  label: 'Consistência temporal',
                  body: 'A análise year-by-year mostra todos os anos no positivo para MES, com win rate oscilando em faixa estreita ao longo de múltiplos regimes de volatilidade. Formalmente, um teste de estabilidade de parâmetros (e.g., CUSUM ou Chow test) não rejeita a hipótese de coeficientes estáveis ao longo do período.',
                },
                {
                  label: <>Simetria <InlineMath math={bt.o62a} /></>,
                  body: <>MES: <InlineMath math={bt.o62b} />. MNQ: <InlineMath math={bt.o62c} />. A razão <InlineMath math={bt.o62d} /> é coerente com estrutura de risco/retorno definida a priori — não com otimização post-hoc de targets.</>,
                },
                {
                  label: 'Profit Factor dentro de limites críveis',
                  body: <>MES: <InlineMath math={bt.o63a} />. MNQ: <InlineMath math={bt.o63b} />. Profit factors acima de 2,5–3 em amostras intradiárias são tipicamente sintomáticos de data-mining. Os valores observados situam-se numa faixa razoável.</>,
                },
              ].map(({ label, body }, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="border-zinc-800/40 bg-zinc-900/20 rounded-xl border p-5">
                    <p className="text-zinc-200 text-sm mb-2" style={{ fontFamily: SERIF }}>{label}</p>
                    <ArticleProse><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* 6.2 */}
            <Reveal delay={0.06} className="mt-10">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-5">§6.2 — Pontos de atenção</p>
            </Reveal>
            <div className="space-y-3">
              {[
                {
                  label: 'Data-mining bias na seleção de frequência',
                  body: <>Se o número de sinais por sessão foi determinado após comparação entre alternativas no mesmo histórico, isso constitui um grau de liberdade adicional. O impacto esperado é pequeno dado <InlineMath math={"N > 4{.}000"} />, mas o viés existe e deve ser registrado. A validação canônica é aplicar a escolha a um sub-período holdout não visto durante a calibração.</>,
                },
                {
                  label: 'Quebra de regime em NQ pós-2020',
                  body: <>A série NQ exibe aceleração expressiva a partir de 2021, consistente com aumento estrutural de volatilidade. Isso não é overfitting — é mudança de regime. Mas se qualquer parâmetro foi ajustado com visibilidade sobre esse período, os estimadores <InlineMath math={bt.o632a} /> e <InlineMath math={bt.o632b} /> estarão contaminados por look-ahead implícito.</>,
                },
                {
                  label: 'Viés de recência nos dados mais recentes',
                  body: 'O sub-período mais recente apresenta win rate no limite superior da faixa histórica. Isso pode refletir condições genuinamente favoráveis ou viés de seleção. A distinção só é resolvível por out-of-sample estrito com data de corte pré-definida.',
                },
                {
                  label: 'Lacuna simulação–execução (execution gap)',
                  body: <>O maior risco estrutural não é overfitting estatístico — é o gap entre a hipótese de preenchimento do backtest e o comportamento real das ordens em live. O motor assume fill garantido ao nível de preço definido. Em live, o mercado pode <em>passar pelo nível sem retornar</em>, gerando misses ou fills a preços adversos. Este gap infla o win rate simulado de forma sistemática e não é corrigível apenas por ajuste de <InlineMath math={bt.o63delta} />.</>,
                },
              ].map(({ label, body }, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="border-l-2 border-amber-500/25 bg-amber-500/[0.03] rounded-r-xl pl-5 pr-5 py-4">
                    <p className="text-zinc-300 text-sm mb-1" style={{ fontFamily: SERIF }}>{label}</p>
                    <ArticleProse><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* 6.3 prova */}
            <Reveal delay={0.06} className="mt-10">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-5">§6.3 — Justificativa formal para múltiplos sinais por sessão</p>
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="space-y-4">
                <p>
                  A escolha de operar <InlineMath math={"K > 1"} /> sinais por sessão decorre de uma prova sobre a distribuição do P&amp;L diário. Seja <InlineMath math={"p"} /> a win rate por sinal e assuma independência entre sinais de uma mesma sessão como aproximação de primeira ordem. A probabilidade de uma sessão encerrar com P&amp;L negativo é:
                </p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="6.3.1"
                name="Probabilidade de sessão perdedora com K sinais independentes"
                formula={bt.def631}
                description="Para p ≈ 0,58, K=1 → P(Loss) ≈ 0,42; K=2 → P(Loss) ≈ 0,18. O segundo sinal não serve para aumentar o retorno esperado — serve para reduzir a probabilidade de dias de resultado negativo puro."
              />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="space-y-4 mt-2">
                <p>
                  O valor esperado do P&amp;L diário com <InlineMath math={"K"} /> sinais é <InlineMath math={bt.kE} /> — escala linearmente. Mas a <strong>distribuição</strong> muda: a massa na cauda esquerda cai de <InlineMath math={"(1-p)"} /> para <InlineMath math={"(1-p)^K"} />. A hipótese de independência é uma aproximação — sinais da mesma sessão compartilham contexto de mercado. Com correlação <InlineMath math={bt.rho} /> entre eles, o estimador real de <InlineMath math={bt.pLoss} /> situa-se entre os extremos:
                </p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="6.3.2"
                name="Bounds para P(sessão perdedora) com correlação"
                formula={bt.def632}
                description="O backtest empírico já captura implicitamente a correlação real entre sinais — as 4k+ operações incluem os pares correlacionados. Os estimadores de MDD e win rate calculados sobre o histórico são, portanto, os mais honestos disponíveis."
              />
            </Reveal>

            {/* 6.4 veredicto */}
            <Reveal delay={0.1} className="mt-8">
              <div className="border border-zinc-700/30 bg-zinc-900/40 rounded-2xl p-7">
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em] mb-4">§6.4 — Veredicto</p>
                <ArticleProse className="space-y-4">
                  <p>
                    A estratégia <strong>não apresenta os sinais clássicos de overfitting</strong>: a amostra é grande o suficiente para estimativas estatisticamente robustas, a parcimônia paramétrica reduz o espaço de data-mining, a simetria win/loss é coerente com a estrutura de risco/retorno definida a priori, e o desempenho se mantém estável em múltiplos sub-períodos e regimes de volatilidade distintos.
                  </p>
                  <p>
                    O risco principal <strong>não está no domínio estatístico</strong> — está na execução. O gap entre preenchimento assumido no backtest e comportamento real das ordens em live é a fonte dominante de incerteza. Esse risco é irredutível por análise de dados históricos e só pode ser quantificado empiricamente através de paper trading com registro granular de fills.
                  </p>
                </ArticleProse>
              </div>
            </Reveal>
          </section>

          <Divider />

          {/* ── §7 LIMITAÇÕES ───────────────────────────────────── */}
          <section id="s-limitations" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="7" title="Limitações e Vieses" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6">
                <p>Todo backtest carrega vieses estruturais que devem ser declarados explicitamente:</p>
              </ArticleProse>
            </Reveal>
            <div className="mt-6 space-y-4">
              {[
                { title: 'Viés de sobrevivência e look-ahead', body: 'A regra de decisão é aplicada ao histórico completo. Mesmo sem look-ahead direto, parâmetros ou limiares derivados do mesmo período criam um viés in-sample implícito.' },
                { title: 'Preenchimento de ordens', body: <>O motor assume preenchimento total ao preço simulado. Em tamanhos maiores, o impacto de mercado é proporcional à profundidade do book — não modelado aqui. O slippage é tratado como parâmetro fixo <InlineMath math={bt.limDelta} /> adicionado ao custo por trade.</> },
                { title: 'Dependência de regime', body: <>Os estimadores <InlineMath math={bt.limMu} /> e <InlineMath math={bt.limSigma} /> são estacionários apenas se o regime de mercado for estável. Períodos de baixa volatilidade e crises produzem distribuições distintas, invalidando interpolação ingênua de Sharpe/Sortino.</> },
                { title: 'Operação live', body: 'A infraestrutura de execução (reconexão de API, latência, gestão de estados, confirmação humana) introduz risco operacional não capturado pelas métricas quantitativas.' },
              ].map(({ title, body }, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="border-l border-zinc-700/40 pl-5">
                    <p className="text-zinc-200 text-sm" style={{ fontFamily: SERIF }}>{title}</p>
                    <ArticleProse className="mt-1"><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── §8 CONSIDERAÇÕES FINAIS ─────────────────────────── */}
          <section id="s-final" className="scroll-mt-20 pb-12">
            <Reveal>
              <SectionHeader n="8" title="Considerações Finais" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-5">
                <p>
                  O valor metodológico do projeto reside na <strong>transparência de ponta a ponta</strong>: mesmos dados, mesmos pressupostos de custo e mesmo código percorrem o backtest, a camada de métricas e a interface de análise. Isso elimina a ambiguidade de "número mágico" escondido no front e permite auditar cada resultado até sua origem.
                </p>
                <p>
                  A separação entre motor de simulação (Python puro), módulo de métricas (pandas/numpy, sem UI) e interface (Streamlit / Jupyter) segue o princípio de responsabilidade única: UI só orquestra; números vêm de funções puras testáveis. O mesmo núcleo serve notebook de exploração, dashboard interativo e eventual robô de execução.
                </p>
                <p>
                  Os resultados aqui apresentados são <strong>ilustrativos da metodologia</strong>, não evidência de rentabilidade futura. A intenção é demonstrar pensamento quantitativo de ponta a ponta — dados, simulação, estatística, incerteza, visualização — e rigor na declaração de limitações.
                </p>
              </ArticleProse>
            </Reveal>

            {footerCredit ? (
              <Reveal delay={0.1} className="mt-16 border-t border-zinc-800/60 pt-6">
                <p className="text-zinc-700 text-xs font-mono">{footerCredit}</p>
              </Reveal>
            ) : null}
          </section>

        </article>
      </div>
    </div>
  )
}
