import { HeroScrollDemo } from '@/components/hero-scroll-demo'
import { PortfolioWorksSection } from '@/components/portfolio-works-section'
import { SplineSceneBasic } from '@/components/spline-scene-basic'

export function HomePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SplineSceneBasic />
      <HeroScrollDemo />
      <PortfolioWorksSection />
    </div>
  )
}
