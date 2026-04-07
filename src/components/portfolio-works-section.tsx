import { CircularGallery } from '@/components/ui/circular-gallery'
import { galleryWorks } from '@/data/gallery-works'

export function PortfolioWorksSection() {
  return (
    <div id="trabalhos" className="w-full scroll-mt-8 bg-background text-foreground">
      <div className="w-full" style={{ height: '500vh' }}>
        <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-12 z-10 mb-6 max-w-lg px-4 text-center md:top-16">
            <h2 className="text-4xl font-bold">Trabalhos</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Clique num card para abrir o trabalho. O backtest mostra um resumo simples com
              gráfico; role para girar a galeria.
            </p>
          </div>
          <div className="h-full w-full">
            <CircularGallery
              items={galleryWorks}
              radius={520}
              autoRotateSpeed={0.015}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
