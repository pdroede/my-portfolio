import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export type Hero21Props = {
  title: string
  description: string
  /** Texto da faixa acima do título. */
  badge?: string
  /** Nome ao lado do ícone na nav. */
  brandLabel?: string
  heroImageSrc: string
  heroImageAlt: string
  primaryCtaLabel?: string
  primaryCtaTo?: string
  secondaryCtaLabel?: string
  secondaryCtaTo?: string
}

const defaultBadge = 'Detailed analytics · dashboards'

export function Hero2({
  title,
  description,
  badge = defaultBadge,
  brandLabel = 'Portfolio',
  heroImageSrc,
  heroImageAlt,
  primaryCtaLabel = 'Ver trabalhos',
  primaryCtaTo = '/#trabalhos',
  secondaryCtaLabel = 'Início',
  secondaryCtaTo = '/',
}: Hero21Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute -top-10 -right-60 z-0 flex flex-col items-end blur-xl">
        <div className="from-purple-600 to-sky-600 z-[1] h-[10rem] w-[60rem] rounded-full bg-gradient-to-b blur-[6rem]" />
        <div className="from-pink-900 to-yellow-400 z-[1] h-[10rem] w-[90rem] rounded-full bg-gradient-to-b blur-[6rem]" />
        <div className="from-yellow-600 to-sky-500 z-[1] h-[10rem] w-[60rem] rounded-full bg-gradient-to-b blur-[6rem]" />
      </div>
      <div className="bg-noise absolute inset-0 z-0 opacity-30" />

      <div className="relative z-10">
        <nav className="container mx-auto mt-6 flex items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <span className="font-bold" aria-hidden>
                ⚡
              </span>
            </div>
            <span className="ml-2 text-xl font-bold text-white">{brandLabel}</span>
          </Link>

          <div className="hidden items-center space-x-6 md:flex">
            <div className="flex items-center space-x-6">
              <NavItem label="Trabalhos" to="/#trabalhos" />
              <NavItem label="Stack" to="/#trabalhos" />
              <NavItem label="Contacto" to="/#trabalhos" />
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={secondaryCtaTo}
                className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Abrir menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                    <span className="font-bold">⚡</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    {brandLabel}
                  </span>
                </Link>
                <button type="button" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Trabalhos" to="/#trabalhos" onNavigate={() => setMobileMenuOpen(false)} />
                <MobileNavItem label="Stack" to="/#trabalhos" onNavigate={() => setMobileMenuOpen(false)} />
                <MobileNavItem label="Contacto" to="/#trabalhos" onNavigate={() => setMobileMenuOpen(false)} />
                <div className="pt-4">
                  <Link
                    to={secondaryCtaTo}
                    className="flex w-full justify-start rounded-lg border border-gray-700 px-4 py-3 text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {secondaryCtaLabel}
                  </Link>
                </div>
                <Link
                  to={primaryCtaTo}
                  className="h-12 rounded-full bg-white px-8 text-center text-base font-medium leading-[3rem] text-black hover:bg-white/90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {primaryCtaLabel}
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-white">{badge}</span>
          <ArrowRight className="h-4 w-4 text-white" aria-hidden />
        </div>

        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl leading-tight font-bold text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">{description}</p>
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link
              to={primaryCtaTo}
              className="h-12 rounded-full bg-white px-8 text-base leading-[3rem] font-medium text-black hover:bg-white/90"
            >
              {primaryCtaLabel}
            </Link>
            <Link
              to={secondaryCtaTo}
              className="h-12 rounded-full border border-gray-600 px-8 text-base leading-[3rem] font-medium text-white hover:bg-white/10"
            >
              {secondaryCtaLabel}
            </Link>
          </div>

          <div className="relative mx-auto my-20 w-full max-w-6xl">
            <div className="absolute inset-0 rounded-lg bg-white opacity-20 blur-[10rem]" />

            <img
              src={heroImageSrc}
              alt={heroImageAlt}
              width={1920}
              height={1080}
              className="relative h-auto w-full rounded-lg shadow-md grayscale"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="text-sm text-gray-300 hover:text-white"
    >
      {label}
    </Link>
  )
}

function MobileNavItem({
  label,
  to,
  onNavigate,
}: {
  label: string
  to: string
  onNavigate: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" aria-hidden />
    </Link>
  )
}
