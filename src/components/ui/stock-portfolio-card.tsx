import { motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export type StockHolding = {
  ticker: string
  name: string
  shares: number
  lastPrice: number
  changeValue: number
  changePercent: number
}

export type NewsArticle = {
  category: string
  time: string
  title: string
  source: string
  href?: string
}

export type StockPortfolioLabels = {
  totalGain: string
  return: string
  holdings: string
  relatedNews: string
  asOfPrefix: string
  /** Label after the numeric quantity (e.g. "shares" / "posições"). */
  units: string
  photoBy?: string
}

const defaultLabels: StockPortfolioLabels = {
  totalGain: 'Total gain',
  return: 'Return',
  holdings: 'Holdings',
  relatedNews: 'Related news',
  asOfPrefix: 'As of',
  units: 'shares',
  photoBy: 'Photo:',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

function StockHoldingItem({
  holding,
  units,
}: {
  holding: StockHolding
  units: string
}) {
  const isPositive = holding.changeValue >= 0
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <span className="font-bold text-muted-foreground">{holding.ticker}</span>
        </div>
        <div>
          <p className="font-semibold text-card-foreground">{holding.name}</p>
          <p className="text-sm text-muted-foreground">
            {holding.shares} {units}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-card-foreground">
          {formatCurrency(holding.lastPrice)}
        </p>
        <div
          className={cn(
            'flex items-center justify-end gap-1 text-sm',
            isPositive ? 'text-green-500' : 'text-red-500',
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{formatCurrency(holding.changeValue)}</span>
          <span>({holding.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  )
}

function NewsItem({ article }: { article: NewsArticle }) {
  return (
    <div className="w-[220px] flex-shrink-0 rounded-lg bg-muted/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{article.category}</span>
        <span aria-hidden>•</span>
        <span>{article.time}</span>
      </div>
      <p className="mb-3 text-sm font-semibold leading-snug text-card-foreground">
        {article.title}
      </p>
      <a
        href={article.href ?? '#'}
        className="flex items-center text-xs font-semibold text-primary hover:underline"
        target={article.href?.startsWith('http') ? '_blank' : undefined}
        rel={article.href?.startsWith('http') ? 'noreferrer' : undefined}
      >
        {article.source} <ArrowRight className="ml-1 h-3 w-3" />
      </a>
    </div>
  )
}

export type StockPortfolioCardProps = {
  totalGain: number
  returnPercentage: number
  asOfDate: string
  holdings: StockHolding[]
  news: NewsArticle[]
  className?: string
  labels?: Partial<StockPortfolioLabels>
}

export function StockPortfolioCard({
  totalGain,
  returnPercentage,
  asOfDate,
  holdings,
  news,
  className,
  labels: labelsProp,
}: StockPortfolioCardProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const isPositiveReturn = returnPercentage >= 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'mx-auto w-full max-w-2xl space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm',
        className,
      )}
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-start justify-between sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-sm text-muted-foreground">{labels.totalGain}</p>
          <h2 className="text-4xl font-bold tracking-tight">
            {formatCurrency(totalGain)}
          </h2>
          <div
            className={cn(
              'mt-1 flex items-center gap-2 text-sm font-medium',
              isPositiveReturn ? 'text-green-500' : 'text-red-500',
            )}
          >
            {isPositiveReturn ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {returnPercentage.toFixed(2)}% {labels.return}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-0">
          {labels.asOfPrefix} {asOfDate}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{labels.holdings}</h3>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {holdings.map((holding) => (
            <StockHoldingItem
              key={holding.ticker}
              holding={holding}
              units={labels.units}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{labels.relatedNews}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-border bg-background p-1 hover:bg-muted"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-background p-1 hover:bg-muted"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
          {news.map((article, index) => (
            <NewsItem key={`${article.title}-${index}`} article={article} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
