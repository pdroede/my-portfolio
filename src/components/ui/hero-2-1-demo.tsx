import { Hero2 } from '@/components/ui/hero-2-1'

/**
 * Secção de demonstração do hero (estilo dashboard / analytics).
 * Importar em qualquer página para pré-visualizar; não está ligado às rotas por defeito.
 */
export function DemoOne() {
  return (
    <div>
      <Hero2
        title="Dashboard quant — Streamlit"
        description="Visualizações interativas e métricas em tempo quase real. Python no backend, foco em clareza para decisões."
        badge="Detailed analytics · dashboards"
        heroImageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&auto=format&fit=crop&q=80"
        heroImageAlt="Dashboard com gráficos e métricas em ecrã"
      />
    </div>
  )
}
