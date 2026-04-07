import { ContainerScroll } from '@/components/ui/container-scroll-animation'

const SERIF = "'EB Garamond', Georgia, serif"

function AboutPanel() {
  return (
    <div
      className="h-full w-full overflow-auto bg-zinc-950 p-6 md:p-10"
      style={{ fontFamily: SERIF }}
    >
      {/* header */}
      <div className="border-b border-zinc-800 pb-6 mb-6">
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.25em] mb-3">
          quant researcher · systematic trading · software engineering
        </p>
        <h2 className="text-zinc-50 text-2xl md:text-3xl font-medium leading-snug">
          Pedro Euede
        </h2>
        <p className="text-zinc-400 text-base md:text-lg mt-1 italic">
          Obcecado com a interseção entre matemática, código e mercados.
        </p>
      </div>

      {/* bio */}
      <div className="space-y-4 text-zinc-400 text-sm md:text-base leading-[1.85]">
        <p>
          Construo sistemas, não opiniões. Minha relação com mercados começa
          onde a maioria para — no momento em que um padrão precisa ser
          transformado em <span className="text-zinc-200">hipótese testável</span>,
          codificado, simulado contra anos de dados e submetido a uma bateria
          de métricas de risco antes de qualquer decisão.
        </p>
        <p>
          Essa obsessão me levou a construir pipelines quantitativos de ponta
          a ponta: da ingestão de dados históricos em alta frequência ao motor
          de simulação, da camada de métricas ao dashboard interativo, do
          paper trading ao robô de execução. Cada número tem origem
          rastreável. Cada premissa é declarada explicitamente.
        </p>
        <p>
          Não me interessa o atalho.{' '}
          <span className="text-zinc-200">
            Me interessa entender por que algo funciona — e provar isso com
            dados.
          </span>
        </p>
      </div>

      {/* pillars */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Research',
            text: 'Hipótese → evidência numérica → validação estatística. Sem atalhos.',
          },
          {
            label: 'Engenharia',
            text: 'Pipelines modulares, métricas puras, código auditável do backtest ao live.',
          },
          {
            label: 'Objetivo',
            text: 'Carreira na interseção de finanças quantitativas e engenharia de software.',
          },
        ].map(({ label, text }) => (
          <div
            key={label}
            className="border border-zinc-800/60 bg-zinc-900/40 rounded-xl p-4"
          >
            <p className="font-mono text-[9px] text-violet-400 uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pt-16 pb-48 md:pt-24 md:pb-96">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4">
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-[0.2em]">
              Bem-vindo ao meu portfólio
            </p>
            <h1
              className="text-foreground text-4xl font-semibold md:text-5xl leading-tight"
              style={{ fontFamily: SERIF }}
            >
              Não opero por intuição.
              <br />
              <span
                className="mt-1 block text-5xl font-bold leading-none italic md:text-[5.5rem] bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Construo sistemas que provam.
              </span>
            </h1>
            <p
              className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mt-4"
              style={{ fontFamily: SERIF }}
            >
              Pesquisa quantitativa, trading sistemático e engenharia de software —
              unidos pela mesma obsessão com dados, rigor e rastreabilidade.
            </p>
          </div>
        }
      >
        <AboutPanel />
      </ContainerScroll>
    </div>
  )
}
