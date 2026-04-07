/* eslint react/jsx-handler-names: "off" */
import { useCallback, useId, useMemo } from 'react'
import type { MouseEvent, TouchEvent } from 'react'
import { appleStock } from '@visx/mock-data'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { scaleLinear, scaleTime } from '@visx/scale'
import {
  defaultStyles,
  Tooltip,
  TooltipWithBounds,
  withTooltip,
} from '@visx/tooltip'
import type { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { bisector, extent, max } from '@visx/vendor/d3-array'
import { timeFormat } from '@visx/vendor/d3-time-format'

export type EquityPoint = { date: string; close: number }

export const FINANCE_BG = '#3b6978'
export const FINANCE_BG2 = '#204051'
export const FINANCE_ACCENT = '#edffea'
export const FINANCE_ACCENT_DARK = '#75daad'

export type EquityChartTheme = {
  background: string
  background2?: string
  accent: string
  accentSecondary: string
  accentDot: string
  tooltipBg: string
  tooltipBorder: string
  tooltipColor: string
  useGradientSurface: boolean
  /** Área com gradiente nativo (CSS vars) — modo página. */
  useCssVarAreaGradient?: boolean
}

export const defaultEquityDarkTheme: EquityChartTheme = {
  background: '#000000',
  accent: 'hsl(158 64% 52%)',
  accentSecondary: 'hsl(217 91% 65%)',
  accentDot: 'hsl(152 71% 45%)',
  tooltipBg: 'hsl(240 10% 8%)',
  tooltipBorder: 'hsl(240 6% 18%)',
  tooltipColor: 'hsl(0 0% 96%)',
  useGradientSurface: false,
  useCssVarAreaGradient: false,
}

export const financeTealTheme: EquityChartTheme = {
  background: FINANCE_BG,
  background2: FINANCE_BG2,
  accent: FINANCE_ACCENT,
  accentSecondary: '#f9a825',
  accentDot: FINANCE_ACCENT_DARK,
  tooltipBg: FINANCE_BG,
  tooltipBorder: 'rgba(255,255,255,0.35)',
  tooltipColor: '#ffffff',
  useGradientSurface: true,
  useCssVarAreaGradient: false,
}

/** Integrado ao fundo da página (preto), cores `--chart-*`, sem cartão. */
export const pageEmbeddedTheme: EquityChartTheme = {
  background: 'transparent',
  accent: 'var(--chart-3)',
  accentSecondary: 'var(--chart-2)',
  accentDot: 'var(--chart-1)',
  tooltipBg: 'hsl(240 10% 8% / 0.94)',
  tooltipBorder: 'hsl(240 6% 22%)',
  tooltipColor: 'hsl(0 0% 96%)',
  useGradientSurface: false,
  useCssVarAreaGradient: true,
}

const DEFAULT_SLICE = appleStock.slice(800)

const formatDate = timeFormat("%d %b '%y")

const getDate = (d: EquityPoint) => new Date(d.date)
const getEquity = (d: EquityPoint) => d.close

export type EquityChartProps = {
  width: number
  height: number
  margin?: { top: number; right: number; bottom: number; left: number }
  data?: EquityPoint[]
  secondaryData?: EquityPoint[]
  /** `page` = fundo transparente, sem grid, sem cartão, cores do tema. */
  variant?: 'portfolio' | 'teal' | 'page'
  theme?: Partial<EquityChartTheme>
}

type TooltipData = EquityPoint

const tooltipBaseStyles = {
  ...defaultStyles,
  borderRadius: 8,
  fontSize: 12,
}

function EquityChartInner({
  width,
  height,
  margin = { top: 12, right: 12, bottom: 12, left: 12 },
  data,
  secondaryData,
  variant = 'portfolio',
  theme: themeProp,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
}: EquityChartProps & WithTooltipProvidedProps<TooltipData>) {
  const baseTheme =
    variant === 'page'
      ? pageEmbeddedTheme
      : variant === 'teal'
        ? financeTealTheme
        : defaultEquityDarkTheme
  const theme: EquityChartTheme = { ...baseTheme, ...themeProp }
  const series = data ?? DEFAULT_SLICE
  const uid = useId().replace(/:/g, '')
  const areaFillId = `equity-fill-${uid}`
  const bgGradId = `equity-bg-${uid}`

  const tooltipStyles = {
    ...tooltipBaseStyles,
    background: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    color: theme.tooltipColor,
  }

  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)

  const maxPrimary = max(series, getEquity) ?? 0
  const maxSecondary = secondaryData?.length
    ? max(secondaryData, getEquity) ?? 0
    : 0
  const domainMax = Math.max(maxPrimary, maxSecondary, 1)

  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(series, getDate) as [Date, Date],
      }),
    [innerWidth, margin.left, series],
  )

  const equityScale = useMemo(
    () =>
      scaleLinear({
        range: [margin.top + innerHeight, margin.top],
        domain: [0, domainMax + innerHeight / 4],
        nice: true,
      }),
    [margin.top, innerHeight, domainMax],
  )

  const bisectDate = useMemo(
    () => bisector<EquityPoint, Date>((d) => new Date(d.date)).left,
    [],
  )

  const handleTooltip = useCallback(
    (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) ?? { x: 0 }
      const x0 = dateScale.invert(x)
      const index = bisectDate(series, x0, 1)
      const d0 = series[index - 1]
      const d1 = series[index]
      if (!d0 && !d1) return
      let d: EquityPoint = d0 ?? d1!
      if (d0 && d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: equityScale(getEquity(d)),
      })
    },
    [showTooltip, equityScale, dateScale, bisectDate, series],
  )

  const secondaryAt = useCallback(
    (primary: EquityPoint) => {
      if (!secondaryData?.length) return undefined
      const i = series.findIndex((p) => p.date === primary.date)
      if (i >= 0 && i < secondaryData.length) return secondaryData[i]
      return undefined
    },
    [secondaryData, series],
  )

  const isPage = variant === 'page'

  if (width < 10) {
    return (
      <div
        className="min-h-[240px] w-full bg-transparent"
        aria-hidden
      />
    )
  }

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className={isPage ? 'overflow-visible' : 'overflow-hidden rounded-xl'}
      >
        <defs>
          {theme.useGradientSurface && theme.background2 ? (
            <LinearGradient
              id={bgGradId}
              from={theme.background}
              to={theme.background2}
            />
          ) : null}
          {theme.useCssVarAreaGradient ? (
            <linearGradient id={areaFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
            </linearGradient>
          ) : (
            <LinearGradient
              id={areaFillId}
              from={theme.accent}
              to={theme.accent}
              toOpacity={0.12}
            />
          )}
        </defs>
        {!isPage ? (
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={
              theme.useGradientSurface
                ? `url(#${bgGradId})`
                : theme.background
            }
            rx={14}
          />
        ) : null}
        <AreaClosed<EquityPoint>
          curve={curveMonotoneX}
          data={series}
          fill={`url(#${areaFillId})`}
          stroke={theme.accent}
          strokeWidth={1}
          x={(d) => dateScale(getDate(d)) ?? 0}
          y={(d) => equityScale(getEquity(d)) ?? 0}
          yScale={equityScale}
        />
        {secondaryData && secondaryData.length > 0 ? (
          <LinePath
            curve={curveMonotoneX}
            data={secondaryData}
            stroke={theme.accentSecondary}
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeWidth={2}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => equityScale(getEquity(d)) ?? 0}
          />
        ) : null}
        <Bar
          fill="transparent"
          height={innerHeight}
          onMouseLeave={() => hideTooltip()}
          onMouseMove={handleTooltip}
          onTouchMove={handleTooltip}
          onTouchStart={handleTooltip}
          rx={isPage ? 0 : 14}
          width={innerWidth}
          x={margin.left}
          y={margin.top}
        />
        {tooltipData ? (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              pointerEvents="none"
              stroke={theme.accentDot}
              strokeDasharray="5,2"
              strokeWidth={2}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              fill="black"
              fillOpacity={0.1}
              pointerEvents="none"
              r={4}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              fill={theme.accentDot}
              pointerEvents="none"
              r={4}
              stroke="white"
              strokeWidth={2}
            />
          </g>
        ) : null}
      </svg>
      {tooltipData ? (
        <div>
          <TooltipWithBounds
            key={tooltipData.date}
            left={tooltipLeft + 12}
            style={tooltipStyles}
            top={tooltipTop - 12}
          >
            {(() => {
              const sec = secondaryAt(tooltipData)
              if (sec) {
                return (
                  <>
                    <span className="opacity-90">Equity </span>
                    <strong>
                      $
                      {getEquity(tooltipData).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      })}
                    </strong>
                    <br />
                    <span className="opacity-90">B&amp;H </span>
                    <strong>
                      $
                      {getEquity(sec).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      })}
                    </strong>
                  </>
                )
              }
              return (
                <>
                  $
                  {getEquity(tooltipData).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  })}
                </>
              )
            })()}
          </TooltipWithBounds>
          <Tooltip
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              color: theme.tooltipColor,
              fontSize: 11,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
            }}
            top={innerHeight + margin.top - 14}
          >
            {formatDate(getDate(tooltipData))}
          </Tooltip>
        </div>
      ) : null}
    </div>
  )
}

export const EquityChart = withTooltip<EquityChartProps, TooltipData>(
  EquityChartInner,
)
