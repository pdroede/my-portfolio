/**
 * KaTeX input strings live here (module-scope `"\\frac…"`).
 * Do not use the same strings as JSX attribute literals `math={"\\frac…"}` — Vite/Rolldown
 * emits them as template literals with doubled backslashes in production, which breaks KaTeX.
 */

export const bt = {
  rSeq: '\\{r_t\\}_{t=1}^{N}',
  def31: 'V_t = V_0 + \\sum_{i=1}^{t} r_i \\cdot c_i - \\sum_{i=1}^{t} \\phi_i',
  def32:
    'DD_t = \\frac{\\max_{s \\leq t} V_s - V_t}{\\max_{s \\leq t} V_s}, \\quad MDD = \\max_{t \\in [0,T]} DD_t',
  def33: '\\text{CAGR} = \\left(\\frac{V_T}{V_0}\\right)^{1/T} - 1',
  def34: '\\mathcal{S} = \\frac{\\bar{r}}{\\hat{\\sigma}_r} \\cdot \\sqrt{f}, \\quad f = \\frac{N}{T}',
  def35:
    '\\mathcal{D} = \\frac{\\bar{r}}{\\sigma_d} \\cdot \\sqrt{f}, \\quad \\sigma_d = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N} \\min(r_i, 0)^2}',
  mes5: '\\$5\\text{ por ponto}',
  mnq2: '\\$2\\text{ por ponto}',
  pipe41:
    '\\{t_{\\text{open}},\\, P_{\\text{open}},\\, P_{\\text{high}},\\, P_{\\text{low}},\\, P_{\\text{close}},\\, V\\}',
  pipe42a: '(P_{\\text{entry}},\\, t_{\\text{entry}})',
  pipe42b: '(P_{\\text{exit}},\\, t_{\\text{exit}})',
  pipe43a: 'r_i^{\\text{gross}} = \\Delta P_i \\cdot \\text{ptval} \\cdot c_i',
  pipe43b: '\\phi = \\$0{,}62',
  pipe43c: 'r_i = r_i^{\\text{gross}} - c_i \\cdot \\phi',
  pipe44a: '\\{r_i\\}',
  pipe44b: 'B = 10{,}000',
  pipe44c: '(\\mu, \\sigma, \\text{win rate})',
  vtBh: 'V_t^{\\text{BH}}',
  v0k: 'V_0 = \\$10{,}000',
  ddCaption: 'DD_t = (\\max_{s \\leq t} V_s - V_t)\\,/\\,\\max_{s \\leq t} V_s',
  metricCagr: '\\text{CAGR}',
  metricS: '\\mathcal{S}',
  metricD: '\\mathcal{D}',
  o61a: 'N_{\\text{ES}} = 4{.}620',
  o61b: 'N_{\\text{NQ}} = 4{.}343',
  o61c: '\\text{SE}(\\hat{p}) = \\sqrt{\\hat{p}(1-\\hat{p})/N} \\approx 0{,}007',
  o61d: '\\pm 1{,}4\\%',
  o62a: '\\mathbb{E}[\\text{win}] \\approx |\\mathbb{E}[\\text{loss}]|',
  o62b: '\\bar{w} = 10{,}58\\text{ pts},\\;\\bar{l} = -10{,}41\\text{ pts}',
  o62c: '\\bar{w} = 48{,}94\\text{ pts},\\;\\bar{l} = -47{,}42\\text{ pts}',
  o62d: '\\bar{w}/|\\bar{l}| \\approx 1{,}02',
  o63a: '\\text{PF} = 1{,}46',
  o63b: '\\text{PF} = 1{,}41',
  o632a: '\\hat{\\mu}_{\\text{NQ}}',
  o632b: '\\hat{\\sigma}_{\\text{NQ}}',
  o63delta: '\\delta',
  kE: 'K \\cdot \\mathbb{E}[r]',
  rho: '\\rho \\in [0,1]',
  def631: 'P(\\text{Loss}_{\\text{sessão}} \\mid K) = (1 - p)^K',
  pLoss: 'P(\\text{Loss}_{\\text{sessão}})',
  def632:
    '(1-p)^K \\;\\leq\\; P(\\text{Loss}_{\\text{sessão}}) \\;\\leq\\; (1-p), \\quad \\rho \\in [0, 1]',
  limDelta: '\\delta',
  limMu: '\\hat{\\mu}',
  limSigma: '\\hat{\\sigma}',
} as const

export const sp = {
  abstractR2: 'R^2_{\\text{OOS}} \\approx 0.40',
  rLog: 'r_t = \\log(P_t / P_{t-1})',
  rvH: '\\text{RV}_h = \\sqrt{\\frac{252}{h} \\sum_{i=1}^{h} r_{t-i}^2}',
  yTarget:
    '\\hat{y}_{t,h} = \\log\\!\\left(\\text{RV}_h^{\\text{forward}}\\right), \\quad \\text{RV}_h^{\\text{forward}} = \\sqrt{\\frac{252}{h}\\sum_{i=1}^{h} r_{t+i}^2}',
  vrp: '\\text{VRP}',
  vrpFormula: '\\text{VRP}_t = \\text{IV}_t^2 - \\text{RV}_{22,t}^2',
  r2oos:
    'R^2_{\\text{OOS}} = 1 - \\frac{\\sum_{t}(y_t - \\hat{y}_t)^2}{\\sum_{t}(y_t - \\bar{y})^2}',
  ttGSPC: '\\texttt{\\^{}GSPC}',
  ttVIX: '\\texttt{\\^{}VIX}',
  ttVIX9D: '\\texttt{\\^{}VIX9D}',
  ttVIX3M: '\\texttt{\\^{}VIX3M}',
  ttVIX6M: '\\texttt{\\^{}VIX6M}',
  ttSKEW: '\\texttt{\\^{}SKEW}',
  feat41: '\\text{VIX}_{9d},\\, \\text{VIX}_{30d},\\, \\text{VIX}_{3m},\\, \\text{VIX}_{6m}',
  feat42: '\\text{VIX}_{3m} - \\text{VIX}_{9d}',
  feat44a: '\\text{RV}_5',
  feat44b: '\\text{RV}_{22}',
  feat44c: '\\text{RV}_5 / \\text{RV}_{22}',
  feat45a: '\\text{VRP}_{30d}',
  feat45b: '\\text{VRP}_{\\text{short}}',
  pipeR2oos: 'R^2_{\\text{OOS}}',
  naiveY: '\\hat{y}_t = \\log(\\text{VIX}_t / 100)',
  harFeats:
    '\\log(\\text{RV}_5),\\, \\log(\\text{RV}_{22}),\\, \\log(\\text{VIX}),\\, \\text{VRP}_{30d},\\, \\text{SKEW}',
  ell1: '\\ell_1',
  dmax: 'd_{\\max}=4',
  ensR2: 'R^2_{\\text{OOS}}',
  tsSplit:
    '\\mathcal{D}_k^{\\text{train}} = \\{(x_t, y_t)\\}_{t=1}^{T_k}, \\quad \\mathcal{D}_k^{\\text{test}} = \\{(x_t, y_t)\\}_{t=T_k+1}^{T_k + \\Delta}',
  metricR2: 'R^2_{\\text{OOS}}',
  metricMAE: '\\text{MAE}',
  metricF: '|\\mathcal{F}|',
  res556a: 'R^2_{\\text{OOS}} \\approx 0.40',
  res556b: 'R^2_{\\text{OOS}} > 0.20',
  shapLog: '\\log(\\text{RV}_{22})',
  shapVRP: '\\text{VRP}_{30d}',
  final604: 'R^2_{\\text{OOS}} \\approx 0.40',
} as const
