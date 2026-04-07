/** Helpers internos para curvas de equity e métricas agregadas. */

export const STARTING_EQUITY = 10_000

export const CONTRACT_POINT_VALUE_MES = 5
export const CONTRACT_POINT_VALUE_MNQ = 2

/** Round-trip por contrato (1 micro × fee), alinhado a `DEFAULT_FEE_PER_MICRO_TRADE` no backtest Python. */
export const DEFAULT_FEE_PER_CONTRACT_ROUND_TRIP = 0.62

export type CompoundTradeInput = {
  entry_time: string
  exit_time: string
  entry_price: number
  stop_price: number
  pnl_points: number
}

export type CompoundExitRow = {
  exit_time: string
  compound_pnl: number
  compound_equity: number
  fee_usd: number
  contracts: number
  risk_usd: number
  r_mult: number
}

export type CompoundEquityOptions = {
  contractPointValue: number
  feePerContractTrade?: number
  maxContracts?: number
  slippagePts?: number
}

function parseTime(iso: string): number {
  return new Date(iso).getTime()
}

export function computeCompoundEquity(
  trades: CompoundTradeInput[],
  options: CompoundEquityOptions,
): CompoundExitRow[] {
  const pt = options.contractPointValue
  const feePer = options.feePerContractTrade ?? 0
  const maxC = options.maxContracts ?? 0
  const slip = options.slippagePts ?? 0

  const sorted = [...trades].sort((a, b) => parseTime(a.entry_time) - parseTime(b.entry_time))
  let equity = STARTING_EQUITY
  const rows: CompoundExitRow[] = []

  for (const row of sorted) {
    const rawContracts = Math.max(1, Math.floor(equity / STARTING_EQUITY))
    const contracts = maxC > 0 ? Math.min(rawContracts, maxC) : rawContracts
    const feePaid = feePer * contracts
    const slipCost = slip * pt * contracts
    const pnlPoints = row.pnl_points
    const pnl = pnlPoints * pt * contracts - feePaid - slipCost
    const riskPoints = Math.abs(row.entry_price - row.stop_price)
    const riskUsd = riskPoints * pt * contracts
    const rMult = riskUsd > 0 ? pnl / riskUsd : 0
    equity += pnl
    rows.push({
      exit_time: row.exit_time,
      compound_pnl: pnl,
      compound_equity: equity,
      fee_usd: feePaid,
      contracts,
      risk_usd: riskUsd,
      r_mult: rMult,
    })
  }

  return rows
}

export function computeDrawdownStats(equity: number[]): {
  maxDrawdownUsd: number
  drawdownPctPeak: number
  drawdownPctInitial: number
} {
  if (equity.length === 0) {
    return { maxDrawdownUsd: 0, drawdownPctPeak: 0, drawdownPctInitial: 0 }
  }
  let peak = equity[0]
  let maxDdUsd = 0
  let maxDdPctPeak = 0
  for (const e of equity) {
    if (e > peak) peak = e
    const ddUsd = peak - e
    if (ddUsd > maxDdUsd) maxDdUsd = ddUsd
    const safePeak = peak === 0 ? Number.NaN : peak
    const pct = safePeak > 0 ? (ddUsd / safePeak) * 100 : 0
    if (pct > maxDdPctPeak) maxDdPctPeak = pct
  }
  const drawdownPctInitial = STARTING_EQUITY > 0 ? (maxDdUsd / STARTING_EQUITY) * 100 : 0
  return {
    maxDrawdownUsd: maxDdUsd,
    drawdownPctPeak: maxDdPctPeak,
    drawdownPctInitial,
  }
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function stdPop(xs: number[]): number {
  if (xs.length === 0) return 0
  const m = mean(xs)
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length)
}

function stdSample(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1))
}

function downsideStdPnl(pnl: number[]): number {
  if (pnl.length === 0) return 0
  return Math.sqrt(mean(pnl.map((x) => Math.min(x, 0) ** 2)))
}

function downsideStdR(r: number[]): number {
  if (r.length === 0) return 0
  return Math.sqrt(mean(r.map((x) => Math.min(x, 0) ** 2)))
}

export type CompoundSummary = {
  totalPnl: number
  pnlPct: number
  maxDrawdownUsd: number
  drawdownPctPeak: number
  drawdownPctInitial: number
  cagr: number
  years: number
  sharpeRatioR: number
  sortinoRatioR: number
  sharpeAnnualizedExcel: number
  sortinoAnnualizedExcel: number
  totalTrades: number
  winRatePct: number
  profitFactor: number
  totalFees: number
}

export function computeCompoundSummary(rows: CompoundExitRow[]): CompoundSummary {
  if (rows.length === 0) {
    return {
      totalPnl: 0,
      pnlPct: 0,
      maxDrawdownUsd: 0,
      drawdownPctPeak: 0,
      drawdownPctInitial: 0,
      cagr: 0,
      years: 0,
      sharpeRatioR: 0,
      sortinoRatioR: 0,
      sharpeAnnualizedExcel: 0,
      sortinoAnnualizedExcel: 0,
      totalTrades: 0,
      winRatePct: 0,
      profitFactor: 0,
      totalFees: 0,
    }
  }

  const pnls = rows.map((r) => r.compound_pnl)
  const rMults = rows.map((r) => r.r_mult)
  const totalPnl = pnls.reduce((a, b) => a + b, 0)
  const pnlPct = (totalPnl / STARTING_EQUITY) * 100

  const eq = rows.map((r) => r.compound_equity)
  const dd = computeDrawdownStats(eq)

  const profitable = pnls.filter((p) => p > 0).length
  const winRatePct = (profitable / pnls.length) * 100
  const grossProfit = pnls.filter((p) => p > 0).reduce((a, b) => a + b, 0)
  const grossLoss = pnls.filter((p) => p < 0).reduce((a, b) => a + b, 0)
  const profitFactor = grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : 0
  const totalFees = rows.reduce((a, r) => a + r.fee_usd, 0)

  const exitDates = rows.map((r) => new Date(r.exit_time))
  const d0 = new Date(Math.min(...exitDates.map((d) => d.getTime())))
  const d1 = new Date(Math.max(...exitDates.map((d) => d.getTime())))
  const years = (d1.getTime() - d0.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  const endEquity = rows[rows.length - 1].compound_equity
  let cagr = 0
  if (years > 0 && STARTING_EQUITY > 0) {
    cagr = (endEquity / STARTING_EQUITY) ** (1 / years) - 1
  }

  const meanR = mean(rMults)
  const stdR = stdPop(rMults)
  const sharpeRatioR = stdR > 0 ? meanR / stdR : 0
  const dsR = downsideStdR(rMults)
  const sortinoRatioR = dsR > 0 ? meanR / dsR : 0

  const meanP = mean(pnls)
  const stdP = stdSample(pnls)
  const dsP = downsideStdPnl(pnls)
  const n = pnls.length
  const tradesPerYear = years > 0 ? n / years : 252
  const sharpeAnnualizedExcel =
    stdP > 0 && tradesPerYear > 0 ? (meanP / stdP) * Math.sqrt(tradesPerYear) : 0
  const sortinoAnnualizedExcel =
    dsP > 0 && tradesPerYear > 0 ? (meanP / dsP) * Math.sqrt(tradesPerYear) : 0

  return {
    totalPnl,
    pnlPct,
    maxDrawdownUsd: dd.maxDrawdownUsd,
    drawdownPctPeak: dd.drawdownPctPeak,
    drawdownPctInitial: dd.drawdownPctInitial,
    cagr,
    years,
    sharpeRatioR,
    sortinoRatioR,
    sharpeAnnualizedExcel,
    sortinoAnnualizedExcel,
    totalTrades: n,
    winRatePct,
    profitFactor,
    totalFees,
  }
}
