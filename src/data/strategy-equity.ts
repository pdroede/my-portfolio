/** Dados de série para o gráfico (índices de exibição). `date` em ISO quando ligado a importação. */
export type StrategyIndexKey = 'sp500' | 'nasdaq'

export const STRATEGY_INDEX_LABELS: Record<StrategyIndexKey, string> = {
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ',
}

export const STRATEGY_INDEX_ORDER: StrategyIndexKey[] = ['sp500', 'nasdaq']

/** Ponto para o BarChart (eixo categórico + valor + data). */
export type StrategyEquityPoint = {
  month: string
  equity: number
  /** YYYY-MM-DD — alinhado aos CSVs. */
  date: string
}

function asChartData(points: StrategyEquityPoint[]): Record<string, unknown>[] {
  return points.map((p) => ({ ...p }))
}

/** Placeholder — trocar quando importares os CSVs reais. */
const SP500_PLACEHOLDER: StrategyEquityPoint[] = [
  { month: 'Jan', equity: 100, date: '2024-01-01' },
  { month: 'Fev', equity: 102, date: '2024-02-01' },
  { month: 'Mar', equity: 101, date: '2024-03-01' },
  { month: 'Abr', equity: 108, date: '2024-04-01' },
  { month: 'Mai', equity: 112, date: '2024-05-01' },
  { month: 'Jun', equity: 110, date: '2024-06-01' },
  { month: 'Jul', equity: 118, date: '2024-07-01' },
  { month: 'Ago', equity: 122, date: '2024-08-01' },
  { month: 'Set', equity: 120, date: '2024-09-01' },
  { month: 'Out', equity: 128, date: '2024-10-01' },
  { month: 'Nov', equity: 131, date: '2024-11-01' },
  { month: 'Dez', equity: 138, date: '2024-12-01' },
]

/** Placeholder — curva distinta do SP até carregares o CSV da NASDAQ. */
const NASDAQ_PLACEHOLDER: StrategyEquityPoint[] = [
  { month: 'Jan', equity: 100, date: '2024-01-01' },
  { month: 'Fev', equity: 99, date: '2024-02-01' },
  { month: 'Mar', equity: 104, date: '2024-03-01' },
  { month: 'Abr', equity: 106, date: '2024-04-01' },
  { month: 'Mai', equity: 115, date: '2024-05-01' },
  { month: 'Jun', equity: 113, date: '2024-06-01' },
  { month: 'Jul', equity: 121, date: '2024-07-01' },
  { month: 'Ago', equity: 119, date: '2024-08-01' },
  { month: 'Set', equity: 126, date: '2024-09-01' },
  { month: 'Out', equity: 132, date: '2024-10-01' },
  { month: 'Nov', equity: 130, date: '2024-11-01' },
  { month: 'Dez', equity: 141, date: '2024-12-01' },
]

export const strategyEquityByIndex: Record<
  StrategyIndexKey,
  StrategyEquityPoint[]
> = {
  sp500: SP500_PLACEHOLDER,
  nasdaq: NASDAQ_PLACEHOLDER,
}

/** Formato esperado pelo BarChart (objeto genérico). */
export function strategyEquityAsChartRows(
  points: StrategyEquityPoint[],
): Record<string, unknown>[] {
  return asChartData(points)
}
