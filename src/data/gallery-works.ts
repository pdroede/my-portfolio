import type { GalleryItem } from '@/components/ui/circular-gallery'

/** Fonte única para a galeria e rotas `/trabalhos/:slug`. */
export const galleryWorks: GalleryItem[] = [
  {
    kind: 'chart',
    slug: 'volatility-forecasting-spx',
    component: 'stock-prediction',
    common: 'Volatility Forecasting — SPX',
    binomial:
      'Prevendo volatilidade realizada do S&P 500 com sinais do mercado de opções: estrutura a termo, VRP e ensemble de modelos.',
    credit: 'Série ilustrativa; previsões geradas sobre dados históricos públicos.',
    photo: {
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80',
      text: 'visualização abstrata de rede neural e predição',
      pos: '50% 50%',
      by: 'julien Tromeur / Unsplash',
    },
  },
  {
    kind: 'chart',
    slug: 'backtest-quant-sp500',
    common: 'Backtest quant — SP500 & NASDAQ',
    binomial:
      'Ideia simples: ver como a estratégia teria evoluído no tempo, frente a comprar o índice e segurar.',
    credit: 'Valores simulados a partir de histórico de trades; ilustrativo.',
  },
  {
    kind: 'image',
    slug: 'dashboard-streamlit',
    heroLayout: true,
    common: 'Dashboard quant',
    binomial: 'Python · Streamlit',
    photo: {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
      text: 'dashboard com gráficos em tela',
      pos: '50% 35%',
      by: 'Luke Chesser / Unsplash',
    },
  },
  {
    kind: 'image',
    slug: 'pipeline-airflow',
    common: 'Pipeline de dados',
    binomial: 'Pandas · Airflow',
    photo: {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
      text: 'servidores e cabos em datacenter',
      pos: '50% 50%',
      by: 'Taylor Vick / Unsplash',
    },
  },
  {
    kind: 'image',
    slug: 'etl-parquet',
    common: 'ETL de mercado',
    binomial: 'APIs · Parquet',
    photo: {
      url: 'https://images.unsplash.com/photo-1642790106117-e829e62a57ea?w=900&auto=format&fit=crop&q=80',
      text: 'gráfico de candlestick em tela',
      pos: '50% 40%',
      by: 'Milo Bader / Unsplash',
    },
  },
  {
    kind: 'image',
    slug: 'automacao-trades',
    common: 'Automação de trades',
    binomial: 'API · Webhooks',
    photo: {
      url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80',
      text: 'mercado financeiro abstrato',
      pos: '50% 45%',
      by: 'Maxim Hopman / Unsplash',
    },
  },
  {
    kind: 'image',
    slug: 'monitor-risco-dash',
    heroLayout: true,
    common: 'Monitor de risco',
    binomial: 'Plotly · Dash',
    photo: {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80',
      text: 'analytics em notebook',
      pos: '50% 40%',
      by: 'Carlos Muza / Unsplash',
    },
  },
  {
    kind: 'image',
    slug: 'cluster-umap',
    common: 'Cluster research',
    binomial: 'scikit · UMAP',
    photo: {
      url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&auto=format&fit=crop&q=80',
      text: 'código em IDE',
      pos: '55% 40%',
      by: 'Christopher Gower / Unsplash',
    },
  },
]

export function getWorkBySlug(slug: string | undefined) {
  if (!slug) return undefined
  return galleryWorks.find((w) => w.slug === slug)
}
