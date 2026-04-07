import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Home,
  LayoutDashboard,
  PieChart,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export function BacktestSidebar() {
  const link =
    'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors'
  const active = 'bg-zinc-800/90 text-zinc-50'

  return (
    <aside className="border-zinc-800/80 bg-zinc-950 flex w-full shrink-0 flex-col border-b lg:h-auto lg:w-56 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-2 border-zinc-800/80 border-b px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
          P
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">Portfolio</p>
          <p className="text-zinc-500 text-xs">Backtest</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <span
          className={cn(link, active, 'pointer-events-none cursor-default')}
          aria-current="page"
        >
          <LayoutDashboard className="size-4 shrink-0 opacity-80" aria-hidden />
          Resumo
        </span>
        <Link to="/" className={link}>
          <Home className="size-4 shrink-0 opacity-80" aria-hidden />
          Início
        </Link>
        <Link to="/#trabalhos" className={link}>
          <BarChart3 className="size-4 shrink-0 opacity-80" aria-hidden />
          Trabalhos
        </Link>
        <span className="text-zinc-600 flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm">
          <PieChart className="size-4 shrink-0 opacity-50" aria-hidden />
          <span className="text-zinc-500">Exportar</span>
          <span className="text-zinc-600 ml-auto text-[10px] uppercase">em breve</span>
        </span>
      </nav>
      <p className="text-zinc-600 hidden px-4 py-4 text-[10px] leading-relaxed lg:block">
        Vista simplificada para leitura rápida. Sem dados brutos.
      </p>
    </aside>
  )
}

type RingGaugeProps = {
  label: string
  valueLabel: string
  fraction: number
  tone?: 'default' | 'warning'
}

export function RingGauge({ label, valueLabel, fraction, tone = 'default' }: RingGaugeProps) {
  const r = 40
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, fraction))
  const dash = c * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="relative h-[104px] w-[104px]">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            className="stroke-zinc-800"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={tone === 'warning' ? '#fbbf24' : '#38bdf8'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dash}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-zinc-100 text-sm font-semibold tabular-nums">
            {valueLabel}
          </span>
        </div>
      </div>
      <p className="text-zinc-500 max-w-[7rem] text-[11px] leading-tight">{label}</p>
    </div>
  )
}

export function BacktestMobileBar() {
  return (
    <div className="border-zinc-800/80 bg-zinc-950 flex items-center gap-3 border-b px-4 py-3 lg:hidden">
      <Link
        to="/#trabalhos"
        className="text-zinc-400 hover:text-zinc-100 flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>
      <span className="text-zinc-600">|</span>
      <span className="text-zinc-300 truncate text-sm font-medium">Resumo do backtest</span>
    </div>
  )
}
