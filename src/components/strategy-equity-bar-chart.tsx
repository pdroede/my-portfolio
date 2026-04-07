import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Search } from 'lucide-react'
import { ParentSize } from '@visx/responsive'
import { AnimatePresence, motion } from 'motion/react'

import {
  BacktestMobileBar,
  BacktestSidebar,
  RingGauge,
} from '@/components/backtest-analytics-parts'
import { fmtPct, fmtRatio, fmtUsd } from '@/components/backtest-report-ui'
import { EquityChart, type EquityPoint } from '@/components/ui/finance-chart'
import { cn } from '@/lib/utils'
import {
  STRATEGY_INDEX_LABELS,
  STRATEGY_INDEX_ORDER,
  type StrategyIndexKey,
} from '@/data/strategy-equity'
import type { StrategyMonthlyPoint } from '@/lib/strategy-backtest-series'
import { DEFAULT_FEE_PER_CONTRACT_ROUND_TRIP } from '@/lib/strategy-compound'
import { useStrategyBacktestBundles } from '@/hooks/use-strategy-backtest-bundles'

export type StrategyEquityBarChartProps = {
  headline: string
  subheadline: string
  footerCredit?: string
}

function monthLabel(ym: string) {
  const parts = ym.split('-')
  const m = parts[1] ? parseInt(parts[1], 10) : 1
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  const y = parts[0]?.slice(2) ?? ''
  return `${months[m - 1] ?? ''}’${y}`
}

function monthlyReturns(monthly: StrategyMonthlyPoint[]) {
  const rows: { key: string; pct: number }[] = []
  for (let i = 1; i < monthly.length; i++) {
    const prev = monthly[i - 1]!.equity
    const cur = monthly[i]!.equity
    if (!prev) continue
    rows.push({
      key: monthly[i]!.month,
      pct: ((cur - prev) / prev) * 100,
    })
  }
  return rows.slice(-12)
}

function KpiMini({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="border-zinc-800/80 bg-zinc-900/30 rounded-xl border p-3">
      <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">{label}</p>
      <p className="text-zinc-50 mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-zinc-500 mt-0.5 text-xs">{hint}</p> : null}
    </div>
  )
}

function DashboardPanel({
  className,
  children,
  title,
  action,
}: {
  className?: string
  children: ReactNode
  title: string
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-zinc-800/80 bg-zinc-900/40 flex flex-col rounded-2xl border p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-zinc-300 text-sm font-medium tracking-wide">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export function StrategyEquityBarChart({
  headline,
  subheadline,
  footerCredit,
}: StrategyEquityBarChartProps) {
  const [index, setIndex] = useState<StrategyIndexKey>('sp500')
  const load = useStrategyBacktestBundles()

  const bundle =
    load.status === 'ready' ? load.byIndex[index] : null

  const primarySeries = useMemo<EquityPoint[] | undefined>(() => {
    if (!bundle?.monthly.length) return undefined
    return bundle.monthly.map((m) => ({
      date: `${m.month}-01T12:00:00.000Z`,
      close: m.equity,
    }))
  }, [bundle])

  const secondarySeries = useMemo<EquityPoint[] | undefined>(() => {
    if (!bundle?.monthly.length) return undefined
    return bundle.monthly.map((m) => ({
      date: `${m.month}-01T12:00:00.000Z`,
      close: m.bhEquity,
    }))
  }, [bundle])

  const bars = useMemo(
    () => (bundle?.monthly.length ? monthlyReturns(bundle.monthly) : []),
    [bundle?.monthly],
  )

  const maxBar = useMemo(
    () => Math.max(...bars.map((b) => Math.abs(b.pct)), 0.01),
    [bars],
  )

  return (
    <div className="bg-zinc-950 text-zinc-100 flex min-h-[100svh] w-full flex-col lg:flex-row">
      <BacktestSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <BacktestMobileBar />

        <div className="border-zinc-800/80 hidden items-center justify-between gap-4 border-b px-6 py-4 lg:flex">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/#trabalhos"
              className="text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100 flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">Trabalhos</span>
            </Link>
            <div className="min-w-0">
              <h1 className="text-zinc-100 truncate text-lg font-semibold tracking-tight md:text-xl">
                {headline}
              </h1>
              <p className="text-zinc-500 truncate text-xs md:text-sm">{subheadline}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="border-zinc-700 bg-zinc-900/80 text-zinc-500 hidden items-center gap-2 rounded-full border px-3 py-2 text-sm md:flex">
              <Search className="size-4 shrink-0 opacity-60" aria-hidden />
              <span className="text-zinc-600">Procurar…</span>
            </div>
            <button
              type="button"
              disabled
              className="border-zinc-700 bg-zinc-900/80 text-zinc-500 flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            >
              <Download className="size-4" aria-hidden />
              <span className="hidden sm:inline">Relatório</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase">
                Índice de referência
              </p>
              <p className="text-zinc-400 mt-1 max-w-xl text-xs leading-relaxed">
                Linha <span className="text-zinc-200">cheia</span>: estratégia · linha{' '}
                <span className="text-zinc-200">tracejada</span>: comprar o índice e manter.
                Comissão {DEFAULT_FEE_PER_CONTRACT_ROUND_TRIP.toFixed(2)} USD/contrato (ida e
                volta).
              </p>
            </div>
            <div
              className="bg-zinc-900/60 inline-flex w-full gap-0.5 rounded-xl p-1 sm:w-auto"
              role="tablist"
              aria-label="Índice da estratégia"
            >
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
                      'relative min-h-9 flex-1 rounded-lg px-4 py-2 text-sm font-medium outline-none sm:flex-none',
                      selected
                        ? 'text-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-300',
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="strategy-index-pill-dash"
                        className="bg-zinc-800 absolute inset-0 -z-10 rounded-lg"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative z-10">{STRATEGY_INDEX_LABELS[key]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div aria-live="polite" className="sr-only">{`Série ativa: ${STRATEGY_INDEX_LABELS[index]}`}</div>

          {load.status === 'loading' ? (
            <p className="text-zinc-500 text-sm">A carregar…</p>
          ) : null}
          {load.status === 'error' ? (
            <p className="text-red-400 text-sm" role="alert">
              {load.message}
            </p>
          ) : null}

          {load.status === 'ready' && bundle && bundle.monthly.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 xl:gap-5"
              >
                {(() => {
                  const s = bundle.compoundSummary
                  const pnlSign = s.pnlPct >= 0 ? '+' : ''
                  return (
                    <>
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
                        <DashboardPanel
                          className="xl:col-span-2 min-h-[320px]"
                          title="Evolução do capital"
                          action={
                            <span className="text-zinc-600 text-xs">Mensal</span>
                          }
                        >
                          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-zinc-800/80 border-b pb-4">
                            <div>
                              <p className="text-zinc-500 text-xs">Resultado acumulado</p>
                              <p className="text-zinc-50 text-2xl font-semibold tabular-nums tracking-tight md:text-3xl">
                                {fmtUsd(s.totalPnl)}
                              </p>
                              <p
                                className={cn(
                                  'mt-1 text-sm font-medium tabular-nums',
                                  s.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400',
                                )}
                              >
                                {pnlSign}
                                {fmtPct(s.pnlPct)} vs. valor inicial
                              </p>
                            </div>
                          </div>
                          <div
                            className="min-h-[220px] w-full flex-1"
                            style={{ aspectRatio: '16 / 9', maxHeight: 360 }}
                          >
                            <ParentSize debounceTime={10}>
                              {({ width, height }) =>
                                width > 8 && height > 8 && primarySeries && secondarySeries ? (
                                  <EquityChart
                                    data={primarySeries}
                                    height={height}
                                    secondaryData={secondarySeries}
                                    variant="page"
                                    width={width}
                                  />
                                ) : null
                              }
                            </ParentSize>
                          </div>
                        </DashboardPanel>

                        <div className="flex flex-col gap-4">
                          <DashboardPanel title="Maior queda (vs. pico)">
                            <p className="text-zinc-50 text-2xl font-semibold tabular-nums">
                              {fmtPct(s.drawdownPctPeak)}
                            </p>
                            <p className="text-zinc-500 mt-1 text-xs">
                              Pior momento desde o máximo histórico
                            </p>
                            <div className="border-zinc-800/80 mt-4 h-16 rounded-lg border bg-zinc-950/80">
                              <div
                                className="from-red-500/30 h-full w-full rounded-lg bg-gradient-to-t to-transparent"
                                style={{
                                  opacity: Math.min(1, s.drawdownPctPeak / 40),
                                }}
                              />
                            </div>
                          </DashboardPanel>
                          <DashboardPanel title="Crescimento médio / ano">
                            <p className="text-zinc-50 text-2xl font-semibold tabular-nums">
                              {fmtPct(s.cagr)}
                            </p>
                            <p className="text-zinc-500 mt-1 text-xs">Média anualizada</p>
                            <div className="border-zinc-800/80 mt-4 h-16 rounded-lg border bg-zinc-950/80">
                              <div
                                className="from-sky-500/25 h-full w-full rounded-lg bg-gradient-to-t to-transparent"
                                style={{
                                  opacity: Math.min(1, Math.max(0, s.cagr) / 25 + 0.15),
                                }}
                              />
                            </div>
                          </DashboardPanel>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-5">
                        <DashboardPanel
                          className="lg:col-span-2"
                          title="Variação mês a mês (últimos 12)"
                        >
                          <div className="flex h-44 items-end justify-between gap-1.5 px-1">
                            {bars.map((b) => {
                              const h = (Math.abs(b.pct) / maxBar) * 100
                              const positive = b.pct >= 0
                              return (
                                <div
                                  key={b.key}
                                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                >
                                  <div className="flex h-36 w-full items-end justify-center">
                                    <div
                                      className={cn(
                                        'w-[85%] max-w-8 rounded-t-md transition-colors',
                                        positive ? 'bg-emerald-500/70' : 'bg-red-500/60',
                                      )}
                                      style={{ height: `${Math.max(8, h)}%` }}
                                      title={`${monthLabel(b.key)}: ${b.pct.toFixed(2)}%`}
                                    />
                                  </div>
                                  <span className="text-zinc-600 truncate text-[10px] leading-none">
                                    {monthLabel(b.key)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </DashboardPanel>

                        <DashboardPanel title="Indicadores rápidos">
                          <div className="flex flex-wrap items-start justify-around gap-6 pt-2">
                            <RingGauge
                              label="Trades com ganho"
                              valueLabel={fmtPct(s.winRatePct)}
                              fraction={Math.min(1, Math.max(0, s.winRatePct / 100))}
                            />
                            <RingGauge
                              label="Resiliência (100% − queda máx.)"
                              valueLabel={fmtPct(
                                Math.max(0, 100 - s.drawdownPctPeak),
                              )}
                              fraction={Math.min(
                                1,
                                Math.max(0, (100 - s.drawdownPctPeak) / 100),
                              )}
                              tone={s.drawdownPctPeak > 25 ? 'warning' : 'default'}
                            />
                            <RingGauge
                              label="Crescimento (vs. 40% ao ano)"
                              valueLabel={fmtPct(s.cagr)}
                              fraction={Math.min(1, Math.max(0, s.cagr / 40))}
                            />
                          </div>
                          <p className="text-zinc-600 mt-6 border-zinc-800/80 border-t pt-4 text-center text-xs">
                            Leitura aproximada para comparação visual — não é recomendação.
                          </p>
                        </DashboardPanel>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                        <div className="border-zinc-800/80 bg-zinc-900/50 border-primary/20 rounded-xl border p-3 ring-1 ring-violet-500/15">
                          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                            Ganho ou perda total
                          </p>
                          <p className="text-zinc-50 mt-1 text-lg font-semibold tabular-nums">
                            {fmtUsd(s.totalPnl)}
                          </p>
                          <p className="text-zinc-500 mt-0.5 text-xs tabular-nums">
                            {fmtPct(s.pnlPct)}
                          </p>
                        </div>
                        <KpiMini
                          label="Operações"
                          value={String(s.totalTrades)}
                          hint="No período"
                        />
                        <KpiMini
                          label="Anos"
                          value={`${fmtRatio(s.years, 1)} a`}
                        />
                        <KpiMini
                          label="Custos"
                          value={fmtUsd(s.totalFees)}
                          hint="Comissões"
                        />
                        <KpiMini
                          label="Profit factor"
                          value={fmtRatio(s.profitFactor)}
                        />
                        <KpiMini
                          label="Índice"
                          value={STRATEGY_INDEX_LABELS[index]}
                        />
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            </AnimatePresence>
          ) : null}

          {load.status === 'ready' && bundle && bundle.monthly.length === 0 ? (
            <p className="text-zinc-500 text-sm">Sem dados para este índice.</p>
          ) : null}

          {footerCredit ? (
            <p className="text-zinc-600 border-zinc-800/80 mt-2 border-t pt-6 text-center text-xs">
              {footerCredit}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
