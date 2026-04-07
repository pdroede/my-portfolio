import type { CompoundSummary } from '@/lib/strategy-compound'

export type StrategyMonthlyPoint = {
  month: string
  equity: number
  bhEquity: number
  drawdownPct: number
}

export type StrategyBacktestBundle = {
  monthly: StrategyMonthlyPoint[]
  compoundSummary: CompoundSummary
  totalFees: number
  maxDrawdownPctPeak: number
}
