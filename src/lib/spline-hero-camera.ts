import type { Application } from '@splinetool/runtime'

type OrbitLike = {
  target: { x: number; y: number; z: number }
  update: () => void
}

const didLowerTarget = new WeakMap<Application, boolean>()

/**
 * Enquadra o robô no hero: afasta a câmera e (uma vez) desce o alvo da órbita
 * para trazer pernas para o quadro. Pode chamar de novo após resize — só o zoom
 * se repete; o target não é deslocado duas vezes.
 */
export function frameHeroRobot(app: Application) {
  app.setZoom(0.52)

  const orbit = (
    app as unknown as { _controls?: { orbitControls?: OrbitLike } }
  )._controls?.orbitControls

  if (orbit?.target && !didLowerTarget.get(app)) {
    orbit.target.y -= 0.55
    orbit.update()
    didLowerTarget.set(app, true)
  }

  app.requestRender()
}
