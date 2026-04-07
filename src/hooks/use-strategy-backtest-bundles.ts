import type { StrategyIndexKey } from '@/data/strategy-equity'
import type { StrategyBacktestBundle } from '@/lib/strategy-backtest-series'

import sp500Data  from '@/data/sp500-summary.json'
import nasdaqData from '@/data/nasdaq-summary.json'

const BUNDLES: Record<StrategyIndexKey, StrategyBacktestBundle> = {
  sp500:  sp500Data  as unknown as StrategyBacktestBundle,
  nasdaq: nasdaqData as unknown as StrategyBacktestBundle,
}

export type StrategyBacktestBundlesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; byIndex: Record<StrategyIndexKey, StrategyBacktestBundle> }

export function useStrategyBacktestBundles(): StrategyBacktestBundlesState {
  return { status: 'ready', byIndex: BUNDLES }
}
