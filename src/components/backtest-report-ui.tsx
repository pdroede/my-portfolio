import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const fmtPct = (n: number, digits = 2) =>
  Number.isFinite(n)
    ? `${n.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}%`
    : '—'

export const fmtRatio = (n: number, digits = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '—'

type ReportSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ReportSection({
  title,
  description,
  children,
  className,
}: ReportSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase opacity-90">
          {title}
        </h3>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

type MetricCardProps = {
  label: string
  value: string
  hint?: string
  emphasize?: boolean
}

export function MetricCard({ label, value, hint, emphasize }: MetricCardProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-card/30 rounded-xl border p-4',
        emphasize && 'border-primary/25 bg-primary/[0.04]',
      )}
    >
      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-foreground mt-1.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
        {value}
      </p>
      {hint ? (
        <p className="text-muted-foreground mt-1 text-xs tabular-nums">{hint}</p>
      ) : null}
    </div>
  )
}
