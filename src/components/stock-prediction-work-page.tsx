import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { InlineMath, BlockMath } from 'react-katex'

import { cn } from '@/lib/utils'

/* ─── TOC sections ──────────────────────────────────────────────────── */

const TOC_SECTIONS = [
  { id: 'sp-abstract',    n: '1', label: 'Abstract' },
  { id: 'sp-intro',       n: '2', label: 'Introdução' },
  { id: 'sp-framework',   n: '3', label: 'Hipótese e Definições' },
  { id: 'sp-data',        n: '4', label: 'Dados e Features' },
  { id: 'sp-models',      n: '5', label: 'Modelos e Validação' },
  { id: 'sp-results',     n: '6', label: 'Resultados' },
  { id: 'sp-limitations', n: '7', label: 'Limitações' },
  { id: 'sp-final',       n: '8', label: 'Considerações Finais' },
]

/* ─── active section hook ───────────────────────────────────────────── */

function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-15% 0px -75% 0px' },
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [ids])
  return active
}

/* ─── reveal animation ──────────────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── typography ────────────────────────────────────────────────────── */

const SERIF = "'EB Garamond', Georgia, 'Times New Roman', serif"

function ArticleProse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      style={{ fontFamily: SERIF }}
      className={cn(
        'text-zinc-300 text-[1.0625rem] leading-[1.9] tracking-[0.01em]',
        '[&_.katex]:tracking-normal',
        '[&_strong]:text-zinc-100 [&_strong]:font-semibold',
        '[&_em]:italic [&_em]:text-zinc-300',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SectionHeader({ n, title, id }: { n: string; title: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-20 pt-2">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[10px] text-zinc-600 tracking-[0.2em] select-none shrink-0">§{n}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      <h2 style={{ fontFamily: SERIF }} className="text-2xl font-medium text-zinc-100 tracking-tight italic">
        {title}
      </h2>
    </div>
  )
}

function Divider() {
  return (
    <div className="my-16 flex items-center gap-4">
      <div className="flex-1 h-px bg-zinc-800/60" />
      <span className="text-zinc-700 text-[10px] font-mono tracking-widest">· · ·</span>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  )
}

/* ─── definition box ────────────────────────────────────────────────── */

function Definition({
  id,
  name,
  formula,
  description,
}: {
  id: string
  name: string
  formula: string
  description: string
}) {
  return (
    <div className="my-7 rounded-r-xl border-l-[3px] border-violet-500/50 bg-zinc-900/50 py-5 pl-6 pr-5">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.2em]">Def. {id}</span>
        <span className="text-zinc-400 text-sm" style={{ fontFamily: SERIF }}>{name}</span>
      </div>
      <div className="overflow-x-auto py-2 text-zinc-200">
        <BlockMath math={formula} />
      </div>
      <p className="text-zinc-500 text-xs leading-relaxed mt-2" style={{ fontFamily: SERIF }}>{description}</p>
    </div>
  )
}

/* ─── metric card ───────────────────────────────────────────────────── */

function MetricCard({ symbol, label, value, delay }: { symbol: string; label: string; value: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="border-zinc-800/60 bg-zinc-900/30 rounded-xl border p-5">
        <div className="text-zinc-600 font-mono text-xs overflow-x-auto mb-3">
          <InlineMath math={symbol} />
        </div>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">{label}</p>
        <p className="text-zinc-50 text-3xl font-semibold tabular-nums tracking-tight mt-1" style={{ fontFamily: SERIF }}>
          {value}
        </p>
      </div>
    </Reveal>
  )
}

/* ─── TOC sidebar ───────────────────────────────────────────────────── */

function TableOfContents({ active }: { active: string }) {
  return (
    <nav className="space-y-0.5">
      <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.2em] mb-4 px-2">
        Conteúdo
      </p>
      {TOC_SECTIONS.map(({ id, n, label }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={cn(
              'flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
              isActive
                ? 'text-zinc-200 bg-zinc-800/60'
                : 'text-zinc-600 hover:text-zinc-400',
            )}
          >
            <span className="font-mono text-[9px] shrink-0 tabular-nums">{n}</span>
            <span style={{ fontFamily: SERIF }} className="leading-snug">{label}</span>
          </a>
        )
      })}
    </nav>
  )
}

/* ─── main ───────────────────────────────────────────────────────────── */

export function StockPredictionWorkPage({
  headline,
  subheadline,
  footerCredit,
}: {
  headline: string
  subheadline: string
  footerCredit?: string
}) {
  const activeSection = useActiveSection(TOC_SECTIONS.map((s) => s.id))

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-svh w-full">

      {/* ── running header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-6 flex items-center justify-between gap-4 py-3">
          <Link
            to="/#trabalhos"
            className="text-zinc-500 hover:text-zinc-200 inline-flex items-center gap-2 text-sm transition-colors shrink-0"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Trabalhos</span>
          </Link>
          <p
            className="text-zinc-500 text-xs truncate hidden md:block"
            style={{ fontFamily: SERIF }}
          >
            {headline}
          </p>
          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest shrink-0 hidden sm:block">
            Working paper
          </span>
        </div>
      </header>

      {/* ── page body ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 flex gap-12 xl:gap-16">

        {/* TOC — desktop only */}
        <aside className="hidden xl:block w-44 shrink-0">
          <div className="sticky top-20 pt-20">
            <TableOfContents active={activeSection} />
          </div>
        </aside>

        {/* article */}
        <article className="min-w-0 flex-1 max-w-[700px] pb-32">

          {/* ── article header ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pt-16 pb-10 border-b border-zinc-800"
          >
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.25em] mb-5">
              Working paper &middot; quantitative research
            </p>
            <h1
              style={{ fontFamily: SERIF }}
              className="text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-zinc-50 italic"
            >
              {headline}
            </h1>
            <p
              style={{ fontFamily: SERIF }}
              className="mt-5 text-zinc-400 text-lg leading-relaxed"
            >
              {subheadline}
            </p>

            {/* metadata */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              {[
                { label: 'Instrumento',  value: 'S&P 500 (SPX · ES=F)' },
                { label: 'Motor',        value: 'Python · scikit-learn · XGBoost' },
                { label: 'Sinais',       value: 'VIX · VIX9D · VIX3M · VIX6M · SKEW' },
                { label: 'Interface',    value: 'Streamlit · Plotly · SHAP' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">{label}</span>
                  <span className="text-zinc-400 text-xs" style={{ fontFamily: SERIF }}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── §1 ABSTRACT ─────────────────────────────────────── */}
          <section id="sp-abstract" className="scroll-mt-20 mt-14">
            <Reveal>
              <SectionHeader n="1" title="Abstract" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6 border border-zinc-800/60 bg-zinc-900/30 rounded-xl p-7">
                <ArticleProse className="space-y-4">
                  <p>
                    Este trabalho descreve a construção de um pipeline de pesquisa para previsão de <strong>volatilidade realizada</strong> do S&amp;P 500 usando sinais extraídos do mercado de opções. A hipótese central é que a superfície de volatilidade implícita — capturada pela família de índices VIX, pela estrutura a termo da volatilidade e pelo prêmio de variância — contém informação preditiva sobre a volatilidade futura que vai além do que o VIX sozinho fornece.
                  </p>
                  <p>
                    O framework combina um modelo HAR-RV+IV de referência acadêmica, uma regressão Lasso para seleção automática de variáveis e um XGBoost para captura de não-linearidades, validados por <em>time-series cross-validation</em> com janelas expansivas. O conjunto de <strong>24 features</strong> organizadas em 7 grupos cobre nível de IV, estrutura a termo, skew de opções, volatilidade realizada histórica, prêmio de variância, vol-of-vol e regime de mercado. O ensemble dos três modelos alcança <strong><InlineMath math={"R^2_{\\text{OOS}} \\approx 0.40"} /></strong>, resultado expressivo para previsão de volatilidade fora de amostra.
                  </p>
                  <p>
                    O sistema é implantado como dashboard Streamlit com previsões ao vivo, análise por regime e interpretabilidade via valores SHAP.
                  </p>
                </ArticleProse>
              </div>
            </Reveal>
          </section>

          <Divider />

          {/* ── §2 INTRODUÇÃO ───────────────────────────────────── */}
          <section id="sp-intro" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="2" title="Introdução e Motivação" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-5">
                <p>
                  Volatilidade não é diretamente observável: é um parâmetro latente inferido a partir de retornos ou do preço de opções. Essa dualidade — volatilidade realizada no passado vs. volatilidade implícita no futuro — cria uma janela de arbitragem informacional: o mercado de opções agrega expectativas de muitos participantes sobre dispersão futura, e essas expectativas são sistematicamente testáveis contra o que de fato ocorre.
                </p>
                <p>
                  A pergunta que guia o projeto não é <em>"o mercado vai subir ou cair?"</em>, mas <em>"qual é a distribuição provável de volatilidade nos próximos 5 a 10 dias úteis?"</em>. Essa é uma pergunta com aplicações diretas em precificação de opções, dimensionamento de posição e gestão de risco.
                </p>
                <p>
                  A motivação metodológica segue a crítica de Goyal e Welch (2008) aplicada a volatilidade: um modelo só é útil se bater o benchmark mais simples <em>fora de amostra</em>. O baseline natural aqui é o próprio VIX — índice amplamente utilizado que já embute expectativa de mercado. Superar o VIX com uma combinação de modelos requer features adicionais com poder preditivo genuíno, validação rigorosa sem <em>look-ahead</em>, e análise de robustez por regime.
                </p>
              </ArticleProse>
            </Reveal>
          </section>

          <Divider />

          {/* ── §3 HIPÓTESE E DEFINIÇÕES ────────────────────────── */}
          <section id="sp-framework" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="3" title="Hipótese e Definições Formais" id="" />
            </Reveal>
            <Reveal delay={0.07}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  Seja <InlineMath math={"P_t"} /> o preço de fechamento do S&amp;P 500 e <InlineMath math={"r_t = \\log(P_t / P_{t-1})"} /> o log-retorno diário. A <strong>volatilidade realizada</strong> anualizada sobre uma janela de <InlineMath math={"h"} /> dias é:
                </p>
              </ArticleProse>
            </Reveal>

            <Reveal delay={0.1}>
              <Definition
                id="3.1"
                name="Volatilidade Realizada"
                formula={"\\text{RV}_h = \\sqrt{\\frac{252}{h} \\sum_{i=1}^{h} r_{t-i}^2}"}
                description="Medida de dispersão histórica anualizada. A raiz de 252 converte a variância diária para escala anual. Usada tanto como feature (RV passada) quanto como alvo (RV futura)."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>
                  A variável-alvo é o logaritmo da volatilidade realizada <em>forward-looking</em> no horizonte <InlineMath math={"h"} />:
                </p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.2"
                name="Variável-alvo"
                formula={"\\hat{y}_{t,h} = \\log\\!\\left(\\text{RV}_h^{\\text{forward}}\\right), \\quad \\text{RV}_h^{\\text{forward}} = \\sqrt{\\frac{252}{h}\\sum_{i=1}^{h} r_{t+i}^2}"}
                description="Trabalhar em log-escala reduz assimetria e estabiliza variância. Previsões em log são convertidas de volta via exp() para interpretação em pontos percentuais de volatilidade anualizada."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>
                  O <strong>Prêmio de Variância</strong> (<InlineMath math={"\\text{VRP}"} />) captura a diferença entre variância implícita e realizada — sinal de quanto os formadores de opções cobram de prêmio de risco:
                </p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.3"
                name="Variance Risk Premium"
                formula={"\\text{VRP}_t = \\text{IV}_t^2 - \\text{RV}_{22,t}^2"}
                description="IV_t é o VIX em escala decimal (VIX/100). VRP positivo indica que o mercado de opções precifica variância acima do que foi realizado — sinal historicamente associado a retornos de volatilidade acima da média."
              />
            </Reveal>

            <Reveal delay={0.07}>
              <ArticleProse className="space-y-4">
                <p>
                  A métrica de avaliação principal segue Goyal-Welch: o <strong><InlineMath math={"R^2"} /> fora de amostra</strong>, que compara o modelo contra o benchmark de prever a média histórica da série:
                </p>
              </ArticleProse>
            </Reveal>
            <Reveal delay={0.1}>
              <Definition
                id="3.4"
                name="R² OOS — Goyal-Welch"
                formula={"R^2_{\\text{OOS}} = 1 - \\frac{\\sum_{t}(y_t - \\hat{y}_t)^2}{\\sum_{t}(y_t - \\bar{y})^2}"}
                description="R² > 0 indica que o modelo bate o baseline de prever a média histórica. R² = 0 é equivalente ao baseline. R² < 0 significa que o modelo é pior que adivinhar a média — critério rigoroso amplamente usado em pesquisa de previsibilidade."
              />
            </Reveal>
          </section>

          <Divider />

          {/* ── §4 DADOS E FEATURES ─────────────────────────────── */}
          <section id="sp-data" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="4" title="Dados e Engenharia de Features" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  Os dados são obtidos via Yahoo Finance cobrindo o período de 2010 a 2024, com atualização diária. Os instrumentos utilizados são o próprio S&amp;P 500 (<InlineMath math={"\\texttt{\\^{}GSPC}"} />) e a família de índices VIX: VIX de 30 dias (<InlineMath math={"\\texttt{\\^{}VIX}"} />), VIX de 9 dias (<InlineMath math={"\\texttt{\\^{}VIX9D}"} />), VIX de 3 meses (<InlineMath math={"\\texttt{\\^{}VIX3M}"} />), VIX de 6 meses (<InlineMath math={"\\texttt{\\^{}VIX6M}"} />) e o índice SKEW (<InlineMath math={"\\texttt{\\^{}SKEW}"} />).
                </p>
                <p>
                  A partir dessas séries são construídas <strong>24 features</strong> organizadas em 7 grupos funcionais. Todas as features são <em>winsorized</em> no 1.º e 99.º percentis para controle de outliers, e a variável-alvo recebe tratamento idêntico para simetria.
                </p>
              </ArticleProse>
            </Reveal>

            <div className="mt-8 space-y-3">
              {[
                {
                  n: '4.1', title: 'Nível de IV (5 features)',
                  body: <>Nível absoluto da volatilidade implícita nos quatro vencimentos: <InlineMath math={"\\text{VIX}_{9d},\\, \\text{VIX}_{30d},\\, \\text{VIX}_{3m},\\, \\text{VIX}_{6m}"} /> e sua versão em log. Captura o regime geral de volatilidade implícita do mercado.</>,
                },
                {
                  n: '4.2', title: 'Estrutura a Termo (4 features)',
                  body: <>Inclinação da curva de volatilidade implícita: diferenças entre vencimentos curtos, longos e spread total (<InlineMath math={"\\text{VIX}_{3m} - \\text{VIX}_{9d}"} />). <em>Contango</em> (curva normal, IV crescente com prazo) vs. <em>backwardation</em> (inversão de curva, sinal de estresse) são estados de regime com comportamento preditivo distinto.</>,
                },
                {
                  n: '4.3', title: 'Skew e Risco de Cauda (2 features)',
                  body: <>Índice SKEW e sua variação recente. O SKEW mede o prêmio de puts OTM sobre calls OTM — sinal de demanda por proteção contra quedas abruptas. Valores elevados indicam que o mercado precifica risco de cauda acima do habitual.</>,
                },
                {
                  n: '4.4', title: 'Volatilidade Realizada Histórica (4 features)',
                  body: <><InlineMath math={"\\text{RV}_5"} /> (semanal) e <InlineMath math={"\\text{RV}_{22}"} /> (mensal) em log-escala, e dois ratios <InlineMath math={"\\text{RV}_5 / \\text{RV}_{22}"} /> que capturam aceleração recente de volatilidade. Fundamento do modelo HAR (Corsi, 2009).</>,
                },
                {
                  n: '4.5', title: 'Prêmio de Variância (3 features)',
                  body: <><InlineMath math={"\\text{VRP}_{30d}"} />, <InlineMath math={"\\text{VRP}_{\\text{short}}"} /> e um indicador direcional de sinal do VRP. Diferencial entre variância implícita e realizada; persistente e historicamente associado a predictabilidade de volatilidade.</>,
                },
                {
                  n: '4.6', title: 'Vol-of-Vol e Range (3 features)',
                  body: <>Desvio-padrão do próprio VIX nos últimos 22 dias (vol-of-vol), range recente do VIX e sua variação em 5 dias. Captura instabilidade no regime de volatilidade — mercados em transição de regime têm vol-of-vol elevado.</>,
                },
                {
                  n: '4.7', title: 'Contexto de Retorno (3 features)',
                  body: <>Retorno acumulado do SPX em 5 e 22 dias e um indicador de regime (<em>low / moderate / high</em>) baseado no nível do VIX. Permitir ao modelo condicionar previsões ao estado de mercado melhora desempenho em períodos de estresse.</>,
                },
              ].map(({ n, title, body }, i) => (
                <Reveal key={n} delay={i * 0.05}>
                  <div className="border-zinc-800/40 bg-zinc-900/20 rounded-xl border p-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-[9px] text-zinc-600 tracking-widest">§{n}</span>
                      <p className="text-zinc-200 text-sm font-medium" style={{ fontFamily: SERIF }}>{title}</p>
                    </div>
                    <ArticleProse><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── §5 MODELOS E VALIDAÇÃO ──────────────────────────── */}
          <section id="sp-models" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="5" title="Modelos e Estratégia de Validação" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-4">
                <p>
                  O pipeline emprega quatro preditores organizados da menor para a maior complexidade, mais um ensemble. A comparação interna revela o que cada camada de complexidade adiciona em termos de <InlineMath math={"R^2_{\\text{OOS}}"} /> — e onde a lei dos retornos decrescentes entra.
                </p>
              </ArticleProse>
            </Reveal>

            <div className="mt-8 space-y-3">
              {[
                {
                  n: 'M.1', title: 'Baseline — VIX Naive',
                  body: <>Usa o próprio VIX como previsão direta: <InlineMath math={"\\hat{y}_t = \\log(\\text{VIX}_t / 100)"} />. Benchmark natural: qualquer modelo que não supere o VIX fora de amostra é descartado. Na literatura, superar o VIX é não-trivial — ele já incorpora expectativa coletiva de mercado.</>,
                },
                {
                  n: 'M.2', title: 'HAR-RV+IV',
                  body: <><em>Heterogeneous Autoregressive model</em> com volatilidade implícita, baseado em Corsi (2009). Regressão linear sobre 5 features selecionadas: <InlineMath math={"\\log(\\text{RV}_5),\\, \\log(\\text{RV}_{22}),\\, \\log(\\text{VIX}),\\, \\text{VRP}_{30d},\\, \\text{SKEW}"} />. Transparente e interpretável; captura persistência de volatilidade em múltiplas escalas de tempo.</>,
                },
                {
                  n: 'M.3', title: 'Lasso (seleção esparsa)',
                  body: <>Regressão <InlineMath math={"\\ell_1"} />-penalizada sobre todas as 24 features. A penalidade zera coeficientes de features não-informativas, gerando um modelo esparso e interpretável. Captura efeitos lineares que o HAR não usa, sem sobreajustar por seleção manual de variáveis.</>,
                },
                {
                  n: 'M.4', title: 'XGBoost',
                  body: <>Gradient boosting com árvores rasas (<InlineMath math={"d_{\\max}=4"} />) para captura de não-linearidades e interações entre features. Usado também para extração de valores SHAP — atribuição de importância por feature em nível de previsão individual. Não domina os modelos lineares uniformemente, mas complementa o ensemble.</>,
                },
                {
                  n: 'M.5', title: 'Ensemble (média simples)',
                  body: <>Média aritmética das previsões de HAR, Lasso e XGBoost. Reduz variância de modelo específico sem introduzir parâmetros adicionais. A diversidade entre modelos lineares e não-lineares gera ganho de <InlineMath math={"R^2_{\\text{OOS}}"} /> consistente sobre qualquer modelo individual.</>,
                },
              ].map(({ n, title, body }, i) => (
                <Reveal key={n} delay={i * 0.05}>
                  <div className="border-zinc-800/40 bg-zinc-900/20 rounded-xl border p-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-[9px] text-zinc-600 tracking-widest">{n}</span>
                      <p className="text-zinc-200 text-sm font-medium" style={{ fontFamily: SERIF }}>{title}</p>
                    </div>
                    <ArticleProse><p className="text-sm">{body}</p></ArticleProse>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.08}>
              <ArticleProse className="mt-8 space-y-4">
                <p>
                  A validação usa <strong>TimeSeriesSplit com 5 folds e janelas expansivas</strong>. A janela de treino cresce a cada fold, e o modelo nunca vê dados futuros. O <em>StandardScaler</em> é ajustado exclusivamente no conjunto de treino de cada fold e aplicado ao teste — sem vazamento de informação de escala.
                </p>
              </ArticleProse>
            </Reveal>

            <Reveal delay={0.1}>
              <Definition
                id="5.1"
                name="TimeSeriesSplit — Janela Expansiva"
                formula={"\\mathcal{D}_k^{\\text{train}} = \\{(x_t, y_t)\\}_{t=1}^{T_k}, \\quad \\mathcal{D}_k^{\\text{test}} = \\{(x_t, y_t)\\}_{t=T_k+1}^{T_k + \\Delta}"}
                description="Onde T_k cresce a cada fold k ∈ {1,…,5} e Δ é o tamanho fixo de cada janela de teste. A junção dos resíduos fora de amostra de todos os folds forma a série usada para calcular R² OOS."
              />
            </Reveal>
          </section>

          <Divider />

          {/* ── §6 RESULTADOS ───────────────────────────────────── */}
          <section id="sp-results" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="6" title="Resultados Empíricos" id="" />
            </Reveal>
            <Reveal delay={0.06}>
              <ArticleProse className="mt-6">
                <p>
                  Os resultados abaixo são calculados sobre os resíduos fora de amostra agregados dos 5 folds de TimeSeriesSplit, horizonte de 5 dias úteis (configuração padrão do dashboard).
                </p>
              </ArticleProse>
            </Reveal>

            {/* metric cards */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <MetricCard symbol={"R^2_{\\text{OOS}}"} label="Ensemble · h = 5d" value="≈ 0.40" delay={0.05} />
              <MetricCard symbol={"\\text{MAE}"} label="Erro médio (p.p. vol)" value="≈ 2.8 pp" delay={0.10} />
              <MetricCard symbol={"h^*"} label="Horizonte ótimo" value="5–10 d" delay={0.15} />
              <MetricCard symbol={"|\\mathcal{F}|"} label="Total de features" value="24" delay={0.20} />
            </div>

            <Reveal delay={0.1}>
              <ArticleProse className="mt-10 space-y-5">
                <p>
                  O ensemble alcança <InlineMath math={"R^2_{\\text{OOS}} \\approx 0.40"} />, superando o VIX Naive (baseline) de forma consistente. Na literatura de previsão de volatilidade, <InlineMath math={"R^2_{\\text{OOS}} > 0.20"} /> já é considerado resultado robusto; valores próximos de 0.40 são expressivos considerando que o benchmark já incorpora expectativas de mercado.
                </p>
                <p>
                  <strong>Análise por horizonte:</strong> o modelo tem melhor desempenho nos horizontes de 5 a 10 dias úteis. No horizonte de 1 dia, o sinal é mais ruidoso e difícil de separar da microestrutura. No horizonte de 21 dias (mensal), a mean-reversion de longo prazo reduz a vantagem preditiva incremental das features de curto prazo.
                </p>
                <p>
                  <strong>Análise por regime:</strong> desempenho avaliado separadamente em três estados de mercado definidos pelo nível do VIX (<em>low</em>, <em>moderate</em>, <em>high</em>). O modelo tende a ser mais preciso em regimes de baixa volatilidade — onde a estrutura a termo é mais estável. Em regimes de estresse, a alta vol-of-vol reduz a previsibilidade, mas o ensemble ainda supera o baseline VIX Naive.
                </p>
                <p>
                  <strong>Interpretabilidade SHAP:</strong> os valores SHAP do XGBoost mostram que as features de maior importância agregada são <InlineMath math={"\\log(\\text{RV}_{22})"} />, <InlineMath math={"\\text{VRP}_{30d}"} /> e a inclinação da estrutura a termo — resultado consistente com a seleção do Lasso, que converge nas mesmas variáveis como features de maior peso.
                </p>
              </ArticleProse>
            </Reveal>
          </section>

          <Divider />

          {/* ── §7 LIMITAÇÕES ───────────────────────────────────── */}
          <section id="sp-limitations" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="7" title="Limitações e Próximos Passos" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-5">
                <p>
                  A versão atual do pipeline opera com <strong>dados públicos gratuitos</strong> (Yahoo Finance), o que impõe limitações metodológicas relevantes. Os índices VIX são calculados sobre maturidades fixas e não equivalem a uma superfície completa de volatilidade implícita. Features baseadas em dados reais de opções — IV por strike, smile de volatilidade, superfície term-structure completa — teriam poder preditivo adicional, mas requerem provedores pagos (Databento, Polygon.io) ou acesso institucional (OptionMetrics via WRDS).
                </p>
                <p>
                  A <strong>latência de dados</strong> no dashboard ao vivo é de aproximadamente 15 minutos (atraso padrão do Yahoo Finance). Para uso em decisões de trading real, seria necessário feed de dados em tempo real com licença profissional.
                </p>
                <p>
                  O modelo é treinado sobre séries a partir de 2010, período que inclui diferentes regimes de política monetária e de volatilidade. A performance em regimes futuros sem análogo histórico — como contextos de taxas fortemente negativas ou eventos de volatilidade sem precedente — não é garantida pela validação em amostra histórica.
                </p>
                <p>
                  <strong>Próximos passos:</strong> integração de surface de IV real (Databento), modelagem de horizonte longo com GARCH-X como baseline adicional, e expansão para outros índices de renda variável com superfície de opções líquida.
                </p>
              </ArticleProse>
            </Reveal>
          </section>

          <Divider />

          {/* ── §8 CONSIDERAÇÕES FINAIS ─────────────────────────── */}
          <section id="sp-final" className="scroll-mt-20">
            <Reveal>
              <SectionHeader n="8" title="Considerações Finais" id="" />
            </Reveal>
            <Reveal delay={0.08}>
              <ArticleProse className="mt-6 space-y-5">
                <p>
                  A contribuição central deste trabalho é metodológica: um pipeline completo de ponta a ponta, de dados brutos até dashboard ao vivo, com separação explícita entre engenharia de features, treinamento com validação sem vazamento, métricas de avaliação e interface de análise. O resultado numérico (<InlineMath math={"R^2_{\\text{OOS}} \\approx 0.40"} />) é relevante, mas o arcabouço que permite auditá-lo é o que garante confiança no número.
                </p>
                <p>
                  A escolha de trabalhar em log-escala, aplicar TimeSeriesSplit em vez de cross-validation convencional, e adotar o VIX como baseline (e não uma média ingênua) reflete o rigor metodológico que a literatura de previsão de volatilidade exige. Modelos que ignoram essas escolhas frequentemente apresentam <InlineMath math={"R^2"} /> inflados por vazamento temporal ou por comparação contra um benchmark fraco.
                </p>
                <p>
                  O sistema é implantado como aplicação Streamlit com atualização automática de previsões, análise de regime em tempo real e interface de exploração interativa — tornando a pesquisa acessível sem expor a implementação subjacente.
                </p>
              </ArticleProse>
            </Reveal>
          </section>

          {/* ── footer ──────────────────────────────────────────── */}
          {footerCredit && (
            <Reveal>
              <div className="mt-20 pt-6 border-t border-zinc-800/40">
                <p className="text-zinc-700 text-xs" style={{ fontFamily: SERIF }}>{footerCredit}</p>
              </div>
            </Reveal>
          )}

        </article>
      </div>
    </div>
  )
}
