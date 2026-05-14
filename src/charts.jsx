import katex from 'katex'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const KR = (t) => ({ __html: katex.renderToString(t, { throwOnError: false }) })
const KT = ({ t }) => <span dangerouslySetInnerHTML={KR(t)} />

const W = 500, H = 300, PAD = { top: 20, right: 20, bottom: 48, left: 58 }
const PW = W - PAD.left - PAD.right
const PH = H - PAD.top - PAD.bottom
const sx = (x, xmin, xmax) => PAD.left + ((x - xmin) / (xmax - xmin)) * PW
const sy = (y, ymin, ymax) => PAD.top + PH - ((y - ymin) / (ymax - ymin)) * PH

function Grid({ xmin, xmax, ymin, ymax, xticks, yticks }) {
  return (
    <g>
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PH} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top + PH} x2={PAD.left + PW} y2={PAD.top + PH} stroke="#94a3b8" strokeWidth={1.5} />
      {xticks.map(x => (
        <g key={x}>
          <line x1={sx(x, xmin, xmax)} y1={PAD.top} x2={sx(x, xmin, xmax)} y2={PAD.top + PH} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={sx(x, xmin, xmax)} y1={PAD.top + PH} x2={sx(x, xmin, xmax)} y2={PAD.top + PH + 4} stroke="#64748b" />
          <text x={sx(x, xmin, xmax)} y={PAD.top + PH + 16} textAnchor="middle" fontSize="11" fill="#475569">{x}</text>
        </g>
      ))}
      {yticks.map(y => (
        <g key={y}>
          <line x1={PAD.left} y1={sy(y, ymin, ymax)} x2={PAD.left + PW} y2={sy(y, ymin, ymax)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={PAD.left - 4} y1={sy(y, ymin, ymax)} x2={PAD.left} y2={sy(y, ymin, ymax)} stroke="#64748b" />
          <text x={PAD.left - 8} y={sy(y, ymin, ymax) + 4} textAnchor="end" fontSize="11" fill="#475569">{y}</text>
        </g>
      ))}
    </g>
  )
}

// ─── Nuage de points + droite(s) ─────────────────────────────────────────────
export function ScatterPlot({ points, xLabel, yLabel, lines = [], xmin, xmax, ymin, ymax, xticks, yticks, title }) {
  const x0 = xmin ?? Math.floor(Math.min(...points.map(p => p[0])) - 0.5)
  const x1 = xmax ?? Math.ceil(Math.max(...points.map(p => p[0])) + 0.5)
  const y0 = ymin ?? Math.floor(Math.min(...points.map(p => p[1])) * 0.92)
  const y1 = ymax ?? Math.ceil(Math.max(...points.map(p => p[1])) * 1.05)
  const xt = xticks ?? points.map(p => p[0])
  const yt = yticks ?? [y0, Math.round((y0 + y1) / 2), y1]
  return (
    <div className="graph-wrap">
      {title && <div className="graph-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
        <Grid xmin={x0} xmax={x1} ymin={y0} ymax={y1} xticks={xt} yticks={yt} />
        {lines.map((ln, i) => (
          <line key={i} x1={sx(x0, x0, x1)} y1={sy(ln.a * x0 + ln.b, y0, y1)} x2={sx(x1, x0, x1)} y2={sy(ln.a * x1 + ln.b, y0, y1)} stroke={ln.color || '#e0296e'} strokeWidth={2} strokeDasharray={ln.dash ? '6,3' : undefined} />
        ))}
        {points.map((p, i) => <circle key={i} cx={sx(p[0], x0, x1)} cy={sy(p[1], y0, y1)} r={5} fill="#1d3a6e" stroke="white" strokeWidth={1.5} />)}
        <text x={PAD.left + PW / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">{xLabel}</text>
        <text x={12} y={PAD.top + PH / 2} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600" transform={`rotate(-90, 12, ${PAD.top + PH / 2})`}>{yLabel}</text>
      </svg>
    </div>
  )
}

// ─── Courbe de fonction ───────────────────────────────────────────────────────
export function FunctionCurve({ fn, xmin, xmax, ymin, ymax, xticks, yticks, xLabel, yLabel, title, extra = [], samples = 400 }) {
  const xs = Array.from({ length: samples }, (_, i) => xmin + (i / (samples - 1)) * (xmax - xmin))
  const allPts = xs.map(x => ({ x, y: fn(x) })).filter(p => isFinite(p.y))

  const segments = []
  let seg = []
  for (const p of allPts) {
    const gap = seg.length > 0 && Math.abs(p.y - seg[seg.length - 1].y) > (ymax - ymin) * 0.35
    const outBounds = p.y < ymin - (ymax - ymin) * 0.1 || p.y > ymax + (ymax - ymin) * 0.1
    if (gap) { if (seg.length > 1) segments.push(seg); seg = [] }
    if (!outBounds) seg.push(p)
    else { if (seg.length > 1) segments.push(seg); seg = [] }
  }
  if (seg.length > 1) segments.push(seg)

  const toPath = (seg) => seg.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xmin, xmax).toFixed(1)},${sy(p.y, ymin, ymax).toFixed(1)}`).join(' ')

  const extraPath = (e) => {
    const xs2 = Array.from({ length: samples }, (_, i) => xmin + (i / (samples - 1)) * (xmax - xmin))
    const ps = xs2.map(x => ({ x, y: e.fn(x) })).filter(p => isFinite(p.y) && p.y >= ymin - 0.1 && p.y <= ymax + 0.1)
    return toPath(ps)
  }

  return (
    <div className="graph-wrap">
      {title && <div className="graph-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
        <Grid xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} xticks={xticks} yticks={yticks} />
        {extra.map((e, i) => {
          if (e.type === 'hline') return <line key={i} x1={PAD.left} y1={sy(e.y, ymin, ymax)} x2={PAD.left + PW} y2={sy(e.y, ymin, ymax)} stroke={e.color || '#94a3b8'} strokeWidth={1.5} strokeDasharray="6,3" />
          if (e.type === 'vline') return <line key={i} x1={sx(e.x, xmin, xmax)} y1={PAD.top} x2={sx(e.x, xmin, xmax)} y2={PAD.top + PH} stroke={e.color || '#94a3b8'} strokeWidth={1.5} strokeDasharray="6,3" />
          if (e.type === 'fn') return <path key={i} d={extraPath(e)} fill="none" stroke={e.color || '#e0296e'} strokeWidth={1.8} strokeDasharray={e.dash ? '7,4' : undefined} />
          if (e.type === 'point') return <circle key={i} cx={sx(e.x, xmin, xmax)} cy={sy(e.y, ymin, ymax)} r={4} fill={e.color || '#ea7c1e'} />
          return null
        })}
        {segments.map((seg, i) => <path key={i} d={toPath(seg)} fill="none" stroke="#1d3a6e" strokeWidth={2.5} />)}
        <text x={PAD.left + PW / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">{xLabel || 'x'}</text>
        <text x={12} y={PAD.top + PH / 2} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600" transform={`rotate(-90, 12, ${PAD.top + PH / 2})`}>{yLabel || 'y'}</text>
      </svg>
    </div>
  )
}

// ─── Tableau de variation style tkz-tab ──────────────────────────────────────
// xVals  : [{tex}]                   — valeurs clés de x
// signs  : ['+' | '-']              — signe de f' entre chaque paire
// arrows : ['up' | 'down']          — sens de variation entre chaque paire
// fVals  : [{tex, pos:'top'|'bot'}] — valeur de f à chaque point clé
export function VariationTable({ xVals, signs, arrows, fVals }) {
  const N = xVals.length
  const HEAD = 56          // largeur colonne labels
  const KCOL = 60          // largeur colonne valeur clé
  const ICOL = 80          // largeur intervalle
  const RX = 30, RS = 30, RF = 60  // hauteurs des lignes
  const TW = HEAD + N * KCOL + (N - 1) * ICOL
  const TH = RX + RS + RF

  // centre x de chaque valeur clé
  const cx = Array.from({ length: N }, (_, i) => HEAD + i * (KCOL + ICOL) + KCOL / 2)

  return (
    <div className="tkztab-wrap">
      <svg viewBox={`0 0 ${TW} ${TH}`} style={{ width: '100%', maxWidth: TW + 20, display: 'block', margin: '0.5rem auto' }}>
        {/* Fond blanc */}
        <rect x={0} y={0} width={TW} height={TH} fill="white" stroke="#1d3a6e" strokeWidth={1.5} rx={3} />

        {/* Séparateurs horizontaux */}
        <line x1={0} y1={RX} x2={TW} y2={RX} stroke="#1d3a6e" strokeWidth={1} />
        <line x1={0} y1={RX + RS} x2={TW} y2={RX + RS} stroke="#1d3a6e" strokeWidth={1} />

        {/* Colonne header sombre */}
        <rect x={0} y={0} width={HEAD} height={TH} fill="#1d3a6e" rx={3} />
        <rect x={HEAD - 4} y={0} width={4} height={TH} fill="#1d3a6e" />

        {/* Labels lignes (en blanc sur fond bleu) */}
        <FO x={0} y={0} w={HEAD} h={RX} c="white"><KT t="x" /></FO>
        <FO x={0} y={RX} w={HEAD} h={RS} c="white"><KT t="f'(x)" /></FO>
        <FO x={0} y={RX + RS} w={HEAD} h={RF} c="white"><KT t="f(x)" /></FO>

        {/* Valeurs de x + séparateurs verticaux */}
        {xVals.map((v, i) => (
          <g key={i}>
            {i > 0 && <line x1={cx[i] - KCOL / 2} y1={0} x2={cx[i] - KCOL / 2} y2={TH} stroke="#94a3b8" strokeWidth={0.8} />}
            <FO x={cx[i] - KCOL / 2} y={0} w={KCOL} h={RX} c="#e8f0ff"><KT t={v.tex} /></FO>
          </g>
        ))}

        {/* Signes de f' dans les intervalles */}
        {signs && signs.map((s, i) => {
          const mx = (cx[i] + cx[i + 1]) / 2
          const col = s === '+' ? '#16803c' : '#dc2626'
          return (
            <g key={i}>
              <text x={mx} y={RX + RS - 7} textAnchor="middle" fontSize="16" fontWeight="900" fill={col}>{s === '+' ? '+' : '−'}</text>
            </g>
          )
        })}
        {/* 0 aux valeurs clés intermédiaires */}
        {signs && xVals.slice(1, -1).map((_, i) => (
          <text key={i} x={cx[i + 1]} y={RX + RS - 7} textAnchor="middle" fontSize="13" fontWeight="700" fill="#475569">0</text>
        ))}

        {/* Valeurs de f(x) aux points clés */}
        {fVals && fVals.map((v, i) => {
          const yPos = v.pos === 'top' ? RX + RS + 10 : RX + RS + RF - 10
          return <FO key={i} x={cx[i] - KCOL / 2} y={yPos - 12} w={KCOL} h={24}><KT t={v.tex} /></FO>
        })}

        {/* Flèches diagonales style tkz-tab */}
        {arrows && arrows.map((dir, i) => {
          const ax1 = cx[i] + KCOL / 2 + 8
          const ax2 = cx[i + 1] - KCOL / 2 - 8
          const yT = RX + RS + 8, yB = RX + RS + RF - 8
          const [ay1, ay2] = dir === 'up' ? [yB, yT] : [yT, yB]
          const col = dir === 'up' ? '#16803c' : '#dc2626'
          const id = `ar${i}`
          return (
            <g key={i}>
              <defs>
                <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L7,2 z" fill={col} />
                </marker>
              </defs>
              <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke={col} strokeWidth={2.2} markerEnd={`url(#${id})`} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── foreignObject helper ─────────────────────────────────────────────────────
function FO({ x, y, w, h, c = '#1d3a6e', children }) {
  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c, fontFamily: 'Inter,sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
        {children}
      </div>
    </foreignObject>
  )
}
