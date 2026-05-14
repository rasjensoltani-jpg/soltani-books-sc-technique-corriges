import { useState, useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './index.css'
import T from './formulas.json'
import { ScatterPlot, FunctionCurve, VariationTable } from './charts.jsx'

const tex = (s, d = false) => ({ __html: katex.renderToString(s, { throwOnError: false, displayMode: d }) })
const IM = ({ t }) => <span dangerouslySetInnerHTML={tex(t)} />
const BM = ({ t }) => <div className="block-math" dangerouslySetInnerHTML={tex(t, true)} />

const StatTable = ({ data }) => (
  <div className="stat-table-wrap">
    <table className="stat-table">
      <thead>
        <tr>
          <th>Paramètre</th>
          <th>Formule</th>
          <th>Résultat</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.label}</td>
            <td>{row.f ? <BM t={row.f} /> : null}</td>
            <td>{row.r ? <BM t={row.r} /> : null}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const GraphDegTable = ({ nodes, dPlus, dMinus, d }) => (
  <div className="stat-table-wrap" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
    <table className="stat-table">
      <thead>
        <tr>
          <th>Sommet</th>
          {nodes.map(n => <th key={n} style={{ textAlign: 'center' }}>{n}</th>)}
        </tr>
      </thead>
      <tbody>
        {d ? (
          <tr>
            <td><BM t="d" /></td>
            {d.map((val, i) => <td key={i}>{val}</td>)}
          </tr>
        ) : (
          <>
            <tr>
              <td><BM t="d^+" /></td>
              {dPlus.map((val, i) => <td key={i}>{val}</td>)}
            </tr>
            <tr>
              <td><BM t="d^-" /></td>
              {dMinus.map((val, i) => <td key={i}>{val}</td>)}
            </tr>
          </>
        )}
      </tbody>
    </table>
  </div>
)

const COLORS = ['#1d3a6e','#e0296e','#00b4a6','#7c3aed','#ea7c1e','#16803c','#dc2626']
function Step({ children, index, title }) {
  const ref = useRef(null)
  const color = COLORS[index % COLORS.length]
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('step-visible'); obs.disconnect() } }, { threshold: 0.05 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="step step-hidden" style={{ '--step-color': color, '--delay': `${index * 0.1}s` }}>
      <div className="step-number" style={{ background: color }}>{index + 1}</div>
      <div className="step-inner">
        <h3 className="step-title" style={{ color }}>{title}</h3>
        <div className="step-body">{children}</div>
      </div>
    </div>
  )
}
const IB = ({ label, children }) => <div className="info-box"><span className="info-label">{label} :</span> {children}</div>
const RB = ({ children }) => <div className="result-box">{children}</div>
const CR = ({ label, fkey }) => <div className="calc-row">{label} : <BM t={T[fkey]} /></div>

// ── Raisonnement par récurrence ───────────────────────────────────────────────
function Rec({ prop, verif, suppo, demo }) {
  return (
    <div className="rec-box">
      <div className="rec-prop"><span className="rec-label">Propriété à démontrer</span>{prop}</div>
      <div className="rec-steps">
        <div className="rec-step rec-init">
          <div className="rec-step-badge">① Vérification</div>
          <div className="rec-step-body">{verif}</div>
        </div>
        <div className="rec-step rec-hyp">
          <div className="rec-step-badge">② Supposition (H.R.)</div>
          <div className="rec-step-body">{suppo}</div>
        </div>
        <div className="rec-step rec-demo">
          <div className="rec-step-badge">③ Démonstration</div>
          <div className="rec-step-body">{demo}</div>
        </div>
      </div>
    </div>
  )
}

// ── T1-E1 ─────────────────────────────────────────────────────────────────────
function T1E1() { return (<>
  <Step index={0} title={<>Déterminant de <IM t={T.A} /></>}>
    <p>On a <IM t={T.matA} /></p>
    <IB label="Méthode">Développement 1ère ligne</IB>
    <BM t={T.detL} /><BM t={T.detC1} /><BM t={T.detC2} />
    <RB><IM t={T.detNeq} /> ⟹ <IM t={T.A} /> <strong>inversible</strong> ✓</RB>
  </Step>
  <Step index={1} title={<>Calcul de <IM t={T.A2} /></>}>
    <p>On calcule <IM t={T.A2P} /> :</p><BM t={T.A2Pm} />
    <IB label="Détail 1ère ligne"><CR label="col 1" fkey="A2R1a" /><CR label="col 2" fkey="A2R1b" /><CR label="col 3" fkey="A2R1c" /></IB>
    <RB><BM t={T.A2R} /></RB>
  </Step>
  <Step index={2} title={<>Calcul de <IM t={T.BdefT} /></>}>
    <BM t={T.Bsub} /><RB><BM t={T.Bres} /></RB>
  </Step>
  <Step index={3} title={<>Montrer que <IM t={T.A3eq} /></>}>
    <p>On a <IM t={T.A3f} /></p><BM t={T.ABP} />
    <IB label="Détail 1ère ligne"><CR label="(1,1)" fkey="ABR1a" /><CR label="(1,2)" fkey="ABR1b" /><CR label="(1,3)" fkey="ABR1c" /></IB>
    <RB><BM t={T.ABR} /></RB>
  </Step>
  <Step index={4} title={<>Déduire <IM t={T.Ainv} /></>}>
    <p>On a <IM t={T.AXB} /> :</p><BM t={T.AiFr} /><RB><BM t={T.AiR} /></RB>
  </Step>
  <Step index={5} title={<>Résolution de <IM t={T.S} /></>}>
    <p>Forme <IM t={T.AXY} /> avec <IM t={T.Ymat} /></p><BM t={T.Xc} />
    <IB label="Détail x"><BM t={T.Xc1} /></IB>
    <RB><BM t={T.XR} /></RB>
  </Step>
  <Step index={6} title={<>Déduction pour <IM t={T.Sp} /></>}>
    <IB label="Astuce">Poser <IM t={T.lnSub} /></IB>
    <BM t={T.lnSys} />
    <p>Même solution. Exponentielle :</p><BM t={T.lnF} />
    <RB><IM t={T.solSet} /></RB>
  </Step>
</>)}

// ── T1-E2 ─────────────────────────────────────────────────────────────────────
function T1E2() { return (<>
  <Step index={0} title={<>Calcul de <IM t="U_1, U_2, U_3" /></>}>
    <IB label="Formule"><IM t="U_{n+1}=\dfrac{1}{U_n}+\dfrac{U_n}{2}" /></IB>
    <BM t={T.T1E2_U0} /><BM t={T.T1E2_U2} /><BM t={T.T1E2_U3} />
    <IB label="Test arithmétique — condition a+c=2b">
      <BM t={T.T1E2_arith} />
    </IB>
    <IB label="Test géométrique — condition a×c=b²">
      <BM t={T.T1E2_geom} />
    </IB>
    <RB>La suite n'est <strong>ni arithmétique ni géométrique</strong> ✓</RB>
  </Step>
  <Step index={1} title={<>Identité <IM t="U_{n+1}-\sqrt{2}=\frac{(U_n-\sqrt{2})^2}{2U_n}" /></>}>
    <BM t={T.T1E2_rec} /><RB>Identité vérifiée ✓</RB>
  </Step>
  <Step index={2} title={<>Montrer que <IM t="U_n\geq\sqrt{2}" /> pour tout <IM t="n\in\mathbb{N}" /></>}>
    <Rec
      prop={<><IM t="P(n)" /> : <IM t="U_n\geq\sqrt{2}" /></>}
      verif={<><p><strong>n = 0 :</strong></p><BM t="U_0=2\geq\sqrt{2}\approx1{,}41" /><p>✓ vrai au rang 0</p></>}
      suppo={<><p>Supposons <IM t="U_n\geq\sqrt{2}" /> pour un <IM t="n" /> fixé.</p><p>On veut montrer <IM t="U_{n+1}\geq\sqrt{2}" />.</p></>}
      demo={<><p>D'après l'identité démontrée à l'étape précédente :</p><BM t={T.T1E2_pos} /><p>Donc <IM t="U_{n+1}\geq\sqrt{2}" /> ✓</p></>}
    />
    <RB>Par récurrence : <IM t="U_n\geq\sqrt{2}" /> pour tout <IM t="n\in\mathbb{N}" /> ✓</RB>
  </Step>
  <Step index={3} title="Suite décroissante et convergente">
    <p>On calcule <IM t="U_{n+1}-U_n" /> :</p>
    <BM t={T.T1E2_dec} /><BM t={T.T1E2_dec2} /><BM t={T.T1E2_lim} />
    <RB>Suite <strong>minorée</strong> par <IM t="\sqrt{2}" /> et <strong>décroissante</strong> ⟹ <strong>convergente</strong> d'après le théorème des suites monotones bornées ✓</RB>
  </Step>
  <Step index={4} title={<>Limite <IM t="\ell" /></>}>
    <p>À la limite <IM t="f(\ell)=\ell" /> :</p>
    <BM t={T.T1E2_fL} /><RB><IM t="\ell=\sqrt{2}" /></RB>
  </Step>
</>)}

// ── T1-E3 ─────────────────────────────────────────────────────────────────────
const STATS_PTS = [[0,398],[1,451],[2,423],[3,501],[4,673],[5,956],[6,1077],[7,1255],[8,1427],[9,1500]]
function T1E3() { return (<>
  <Step index={0} title="Calcul de U̅ et V̅">
    <IB label="Données">Rangs xi ∈ [0;9], dépenses yi (millions DT)</IB>
    <StatTable data={[
      { label: "Moyennes", f: "\\bar{x}, \\bar{y}", r: "\\bar{x}=4{,}5,\\quad \\bar{y}=766{,}1" },
      { label: "Droite de Mayer", f: "y = ax + b", r: "y=150{,}76x+187{,}68" }
    ]} />
    <div className="section-label">Nuage de points</div>
    <ScatterPlot
      points={STATS_PTS}
      xLabel="Rang xi" yLabel="yi (M DT)"
      xmin={-0.5} xmax={9.5} ymin={200} ymax={1600}
      xticks={[0,1,2,3,4,5,6,7,8,9]}
      yticks={[400,600,800,1000,1200,1400,1600]}
      lines={[{ a: 150.76, b: 187.68, color: '#e0296e' }]}
      title="Nuage de points + Droite de Mayer (en rose)"
    />
    <RB>Estimation 2025 (rang 10) : <BM t={T.T1E3_est2025} /></RB>
  </Step>
  <Step index={1} title="Ajustement exponentiel — Z = ln(Y)">
    <StatTable data={[
      { label: "Corrélation r", f: "r(X,Z)", r: "\\approx 0{,}97" },
      { label: "Droite de Z en X", f: "Z = aX + b", r: "Z=0{,}263x+5{,}68" }
    ]} />
    <RB>Estimation 2025 : <BM t={T.T1E3_Y2025} /></RB>
  </Step>
  <Step index={2} title="Quel ajustement choisir ?">
    <IB label="Réalité 2023">68,9 × 0,028 ≈ 1929 M DT (rang 8)</IB>
    <IB label="Affine (rang 8)"><IM t="150{,}76\times8+187{,}68=1393{,}76" /></IB>
    <IB label="Exponentiel (rang 8)"><IM t="e^{0{,}263\times8+5{,}68}\approx2398" /></IB>
    <RB>L'ajustement <strong>affine</strong> est le plus proche ✓</RB>
  </Step>
</>)}

// ── T1-E4 ─────────────────────────────────────────────────────────────────────
function T1E4() {
  const f14 = x => x - Math.E * Math.log(x)
  const delta = x => x
  return (<>
    <Step index={0} title="Limites et comportement">
      <BM t={T.T1E4_f} />
      <IB label="En 0⁺"><BM t={T.T1E4_lim0} /> → asymptote verticale en x=0</IB>
      <IB label="En +∞"><BM t={T.T1E4_liminf} /> → pas d'asymptote horizontale</IB>
      <IB label="Pente à l'infini"><IM t="\lim_{x\to+\infty}\frac{f(x)}{x}=1" /> → la droite Δ: y=x est asymptote oblique</IB>
    </Step>
    <Step index={1} title="Dérivée et tableau de variation">
      <BM t={T.T1E4_fp} />
      <IB label="Signe de f'(x)"><BM t={T.T1E4_tab} /></IB>
      <div className="section-label">Tableau de variation</div>
      <VariationTable
        xVals={[{ tex: '0^+' }, { tex: 'e' }, { tex: '+\\infty' }]}
        signs={['-', '+']}
        arrows={['down', 'up']}
        fVals={[{ tex: '+\\infty', pos: 'top' }, { tex: '0', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
      />
      <RB>Minimum en <IM t="x=e" /> : <BM t={T.T1E4_min} /></RB>
    </Step>
    <Step index={2} title="Courbe (C) et droite Δ: y=x">
      <div className="section-label">Tracé de la courbe</div>
      <FunctionCurve
        fn={f14}
        xmin={0.15} xmax={6} ymin={-0.5} ymax={6}
        xticks={[1,2,3,4,5]} yticks={[0,1,2,3,4,5]}
        title="(C): f(x) = x − e·ln(x)  et  Δ: y = x (en pointillé)"
        extra={[{ type:'fn', fn: delta, color:'#e0296e', dash: true }]}
      />
      <IB label="Position de (C) et Δ">Pour <IM t="x>0" /> : <IM t="f(x)-x=-e\ln x" />. Signe = signe de <IM t="-\ln x" /></IB>
      <IB label="Conclusion"><IM t="(C)" /> au-dessus de Δ pour <IM t="x\in]0;1[" />, en dessous pour <IM t="x>1" /></IB>
    </Step>
    <Step index={3} title="Primitive F et intégrale">
      <p>On vérifie <IM t="g'(x)=e\ln x" /> :</p>
      <BM t={T.T1E4_gp} />
      <IB label="Primitive de f s'annulant en 1"><BM t={T.T1E4_F} /></IB>
      <div className="section-label">Calcul de l'intégrale</div>
      <BM t={T.T1E4_I} />
      <BM t={T.T1E4_I2} />
      <RB><BM t={T.T1E4_Ires} /></RB>
    </Step>
  </>)
}

// ── T2-E1 ─────────────────────────────────────────────────────────────────────
function T2E1() { return (<>
  <Step index={0} title={<>Déterminant de <IM t="A" /> en fonction de <IM t="\alpha" /></>}>
    <p>On a <IM t={T.T2E1_matA2} /></p>
    <BM t={T.T2E1_detA} /><BM t={T.T2E1_detA2} />
    <RB><IM t="A" /> inversible <IM t="\iff\alpha\neq1" /></RB>
  </Step>
  <Step index={1} title={<>Trouver <IM t="\alpha" /> tel que <IM t="A\times B=2I_3" /></>}>
    <BM t={T.T2E1_AB2I} />
    <RB><BM t={T.T2E1_Ainv2} /></RB>
  </Step>
  <Step index={2} title="Mise en équation du problème du bus">
    <IB label="Variables"><IM t="x" /> = couples, <IM t="y" /> = femmes seules, <IM t="z" /> = enfants</IB>
    <BM t={T.T2E1_sys} />
  </Step>
  <Step index={3} title="Résolution matricielle">
    <BM t={T.T2E1_Xsol} />
    <IB label="Détail 1ère ligne"><CR label="x" fkey="T2E1_XR1a" /><CR label="y" fkey="T2E1_XR1b" /><CR label="z" fkey="T2E1_XR1c" /></IB>
    <RB><BM t={T.T2E1_sol} /></RB>
  </Step>
</>)}

// ── T2-E2 ─────────────────────────────────────────────────────────────────────
function T2E2() { return (<>
  <Step index={0} title={<>Calcul de <IM t="U_1, U_2" />, monotonie et convergence</>}>
    <IB label="Calculs"><BM t="U_1=e^0\cdot1=1" /><BM t="U_2=e^{-1}\cdot1=\tfrac{1}{e}" /></IB>
    <IB label="Positivité">Si <IM t="U_n>0" />, alors <IM t="U_{n+1}=e^{-n}U_n>0" /> ✓</IB>
    <IB label="Décroissance"><IM t="e^{-n}\leq1\implies U_{n+1}=e^{-n}U_n\leq U_n" /> ✓</IB>
    <RB>Suite <strong>minorée</strong> par <IM t="0" /> et <strong>décroissante</strong> ⟹ <strong>convergente</strong> d'après le théorème des suites monotones bornées ✓</RB>
  </Step>
  <Step index={1} title={<>Suite <IM t="V_n=\ln(U_n)" /></>}>
    <p>Relation de récurrence :</p><BM t={T.T2E2_Vrec} />
    <IB label="Somme téléscopique"><BM t={T.T2E2_Vn_r} /></IB>
  </Step>
  <Step index={2} title={<>Formule de <IM t="U_n" /> et limite</>}>
    <BM t={T.T2E2_Un} />
    <RB><BM t={T.T2E2_lim} /></RB>
  </Step>
</>)}

// ── T2-E3 ─────────────────────────────────────────────────────────────────────
const STATS2_PTS = [[1,8.6],[6,9],[11,9.5],[16,9.4],[21,9.5]]
function T2E3() { return (<>
  <Step index={0} title="Moyennes et Covariance">
    <StatTable data={[
      { label: "Moyenne X", f: "\\overline{X}", r: "11" },
      { label: "Moyenne Y", f: "\\overline{Y}", r: "9{,}2" },
      { label: "Écart-type X", f: "\\sigma_X", r: "\\approx 7{,}07" },
      { label: "Écart-type Y", f: "\\sigma_Y", r: "\\approx 0{,}35" },
      { label: "Covariance", f: "\\text{Cov}(X,Y)", r: "2{,}3" },
      { label: "Corrélation r", f: "r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X\\sigma_Y}", r: "\\approx 0{,}92" }
    ]} />
    <RB>{T.T2E3_rint}</RB>
  </Step>
  <Step index={1} title="Ajustement Affine (Moindres Carrés)">
    <div className="section-label">Nuage de points</div>
    <ScatterPlot
      points={STATS2_PTS}
      xLabel="Rang Xi" yLabel="Conso Yi (kg)"
      xmin={0} xmax={22} ymin={8} ymax={10}
      xticks={[1,6,11,16,21]}
      yticks={[8,8.5,9,9.5,10]}
      lines={[{ a: 0.046, b: 8.694, color: '#e0296e' }]}
      title="Nuage de points + Droite de régression"
    />
    <StatTable data={[
      { label: "Coefficient a", f: "a = \\frac{\\text{Cov}(X,Y)}{V(X)}", r: "0{,}046" },
      { label: "Coefficient b", f: "b = \\overline{Y} - a\\overline{X}", r: "8{,}694" }
    ]} />
    <RB><BM t={T.T2E3_D} /></RB>
  </Step>
  <Step index={2} title="Estimations et Calcul de prix">
    <IB label="Estimation 2024 (rang 30)"><BM t={T.T2E3_est2024} /></IB>
    <IB label="Total conso 2024 (+20%)"><BM t={T.T2E3_tot2024} /></IB>
    <IB label="Conso autres viandes"><BM t={T.T2E3_autres} /></IB>
    <div className="section-label">Calcul du prix du mouton</div>
    <IB label="Équation de dépense"><BM t={T.T2E3_prix} /></IB>
    <RB><BM t={T.T2E3_pm} /></RB>
  </Step>
</>)}

// ── T2-E4 ─────────────────────────────────────────────────────────────────────
function T2E4() { 
  const f24 = x => Math.exp(x) - Math.exp(-x) + x
  const d24 = x => x
  return (<>
  <Step index={0} title="Parité et Limites">
    <IB label="Parité"><BM t={T.T2E4_imp} /></IB>
    <IB label="Limite en +∞"><BM t={T.T2E4_lim} /></IB>
    <IB label="Direction asymptotique"><BM t={T.T2E4_limx} /></IB>
    <RB>{T.T2E4_int}</RB>
  </Step>
  <Step index={1} title="Dérivée et Variations">
    <IB label="Dérivée"><BM t={T.T2E4_fp} /></IB>
    <div className="section-label">Tableau de variation</div>
    <VariationTable
      xVals={[{ tex: '-\\infty' }, { tex: '+\\infty' }]}
      signs={['+']}
      arrows={['up']}
      fVals={[{ tex: '-\\infty', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
    />
  </Step>
  <Step index={2} title="Inflexion et Tangente">
    <IB label="Dérivée seconde"><BM t={T.T2E4_fpp} /></IB>
    <IB label="Point d'inflexion"><BM t={T.T2E4_inf} /></IB>
    <RB><BM t={T.T2E4_T} /></RB>
  </Step>
  <Step index={3} title="Courbes et Position Relative">
    <div className="section-label">Tracé de (C) et Δ</div>
    <FunctionCurve
      fn={f24}
      xmin={-2} xmax={2} ymin={-4} ymax={4}
      xticks={[-2,-1,0,1,2]} yticks={[-4,-2,0,2,4]}
      title="(C): f(x) et Δ: y = x (en pointillé)"
      extra={[
        { type:'fn', fn: d24, color:'#e0296e', dash: true },
        { type:'fn', fn: x => 3*x, color:'#16803c', dash: true } // Tangente
      ]}
    />
    <IB label="Position (f(x) - x)"><BM t={T.T2E4_pos} /></IB>
    <RB><BM t={T.T2E4_pos2} /> ⟹ (C) est au-dessus de Δ sur ]0;+∞[ et en-dessous sur ]-∞;0[</RB>
  </Step>
  <Step index={4} title="Calcul d'Aire">
    <IB label="Calcul de I"><BM t={T.T2E4_I} /><BM t={T.T2E4_I2} /></IB>
    <IB label="Aire totale S"><BM t={T.T2E4_S} /></IB>
    <RB><BM t={T.T2E4_S2} /></RB>
  </Step>
</>)}

// ── T3-E1 ─────────────────────────────────────────────────────────────────────
function T3E1() { return (<>
  <Step index={0} title={<>Déterminant de <IM t="A" /></>}>
    <p><IM t={T.T3E1_matA3} /></p>
    <BM t={T.T3E1_detA3} /><RB><BM t={T.T3E1_detA3b} /></RB>
  </Step>
  <Step index={1} title={<>Calcul de <IM t="A\times B" /> et <IM t="A^{-1}" /></>}>
    <BM t={T.T3E1_AB3} /><BM t={T.T3E1_AB3r} />
    <RB><BM t={T.T3E1_Ainv3} /></RB>
  </Step>
  <Step index={2} title="Résolution du système (S)">
    <BM t={T.T3E1_sysSol} /><BM t={T.T3E1_XR3} />
    <RB><IM t="x=4,\quad y=12,\quad z=-1" /></RB>
  </Step>
  <Step index={3} title={<>Suite <IM t="U_{n+1}=4U_n+12n-1" /></>}>
    <IB label="Système">On utilise <IM t="U_1=3,\;U_2=13,\;U_3=115" /> et on résout <IM t="(S)" /></IB>
    <RB><IM t="a=4,\quad b=12,\quad c=-1\implies U_{n+1}=4U_n+12n-1" /></RB>
  </Step>
</>)}

// ── T3-E2 ─────────────────────────────────────────────────────────────────────
function T3E2() { return (<>
  <Step index={0} title="Graphe et Matrice">
    <IB label="Graphe orienté"><BM t={T.T3E2_orient} /></IB>
    <IB label="Arêtes"><BM t={T.T3E2_aretes} /></IB>
    <RB><BM t={T.T3E2_eul} /></RB>
  </Step>
  <Step index={1} title="Chemins et Tournée minimale">
    <IB label="Chemins de A à A (longueur 6)"><BM t={T.T3E2_M6} /></IB>
    <IB label="Cycles complets"><BM t={T.T3E2_cyc} /></IB>
    <RB>Durée minimale : <BM t={T.T3E2_poids} /></RB>
  </Step>
</>)}

// ── T3-E3 Probabilités ────────────────────────────────────────────────────────
function T3E3() { return (<>
  <Step index={0} title="Arbre de probabilités">
    <IB label="Données"><IM t="P(S)=0{,}25,\;P(D|S)=0{,}10,\;P(D|\bar{S})=0{,}05" /></IB>
    <IB label="Structure">Arbre à 2 niveaux : S/S̄ puis D/D̄</IB>
  </Step>
  <Step index={1} title="Probabilité totale P(D)">
    <BM t={T.T3E3_PD} /><BM t={T.T3E3_PDval} />
    <RB><IM t="P(D)=0{,}0625" /> ✓</RB>
  </Step>
  <Step index={2} title="Probabilité conditionnelle P(S|D)">
    <BM t={T.T3E3_PSD} /><RB><IM t="P(S|D)=0{,}4=40\%" /></RB>
  </Step>
  <Step index={3} title="Au moins 1 habitant avec problème de dos (n=3)">
    <BM t={T.T3E3_Pau3} /><BM t={T.T3E3_Pau3r} />
    <RB><IM t="P(\text{au moins 1})\approx0{,}176" /></RB>
  </Step>
</>)}

// ── T3-E4 ─────────────────────────────────────────────────────────────────────
function T3E4() { 
  const f34 = x => Math.log(x) / x
  return (<>
  <Step index={0} title="Limites et Asymptotes">
    <BM t={T.T3E4_f} />
    <IB label="En 0⁺"><BM t={T.T3E4_lim0} /></IB>
    <IB label="En +∞"><BM t={T.T3E4_liminf} /></IB>
  </Step>
  <Step index={1} title="Dérivée et Variations">
    <IB label="Dérivée"><BM t={T.T3E4_fp} /></IB>
    <IB label="Signe"><BM t={T.T3E4_signe} /></IB>
    <div className="section-label">Tableau de variation</div>
    <VariationTable
      xVals={[{ tex: '0' }, { tex: 'e' }, { tex: '+\\infty' }]}
      signs={['+', '-']}
      arrows={['up', 'down']}
      fVals={[{ tex: '-\\infty', pos: 'bot' }, { tex: '1/e', pos: 'top' }, { tex: '0', pos: 'bot' }]}
    />
  </Step>
  <Step index={2} title="Racine et Signe">
    <IB label="Racine de f"><BM t={T.T3E4_zero} /></IB>
    <RB>f(x) &lt; 0 sur ]0;1[ et f(x) &gt; 0 sur ]1;+∞[ ✓</RB>
  </Step>
  <Step index={3} title="Courbe (C)">
    <div className="section-label">Tracé de f(x)</div>
    <FunctionCurve
      fn={f34}
      xmin={0.1} xmax={6} ymin={-1} ymax={0.5}
      xticks={[1,2,3,4,5]} yticks={[-1,-0.5,0,0.5]}
      title="(C): f(x) = ln(x) / x"
      extra={[
        { type:'hline', y:0, color:'#94a3b8' },
        { type:'vline', x:0, color:'#94a3b8' },
        { type:'point', x:1, y:0, color:'#e0296e' },
        { type:'point', x:Math.E, y:1/Math.E, color:'#e0296e' }
      ]}
    />
  </Step>
  <Step index={4} title="Primitive et Aire">
    <IB label="Primitive g(x)"><BM t={T.T3E4_g} /></IB>
    <IB label="Intégrale"><BM t={T.T3E4_I} /></IB>
    <RB>L'aire (f(x) &gt; 0 sur [1;e]) est : <BM t={T.T3E4_S} /></RB>
  </Step>
</>)}

// ── T4-E1 ─────────────────────────────────────────────────────────────────────
function T4E1() { return (<>
  <Step index={0} title={<>Calcul de <IM t="A^2" /> et identité remarquable</>}>
    <p><IM t={T.T4E1_matA4} /></p><BM t={T.T4E1_A4sq} />
    <BM t={T.T4E1_eq} />
    <RB><IM t="A^2-5A+4I_3=O" /> ✓</RB>
  </Step>
  <Step index={1} title={<>En déduire <IM t="A^{-1}" /></>}>
    <BM t={T.T4E1_inv} /><RB><BM t={T.T4E1_Ainv4} /></RB>
  </Step>
  <Step index={2} title="Résolution du système (S)">
    <BM t={T.T4E1_sys4} /><BM t={T.T4E1_Xsol4} />
    <RB><BM t={T.T4E1_sol4} /></RB>
  </Step>
</>)}

// ── T4-E2 Suites ──────────────────────────────────────────────────────────────
function T4E2() { return (<>
  <Step index={0} title={<>Calcul de <IM t="U_1" /> et <IM t="U_2" /></>}>
    <BM t={T.T4E2_U1} /><BM t={T.T4E2_U2} />
    <IB label="Récurrence">Si <IM t="U_n>e" />, alors <IM t="U_{n+1}=\sqrt{eU_n}>\sqrt{e\cdot e}=e" /> ✓</IB>
  </Step>
  <Step index={1} title={<>Suite géométrique <IM t="V_n=\ln(U_n)-1" /></>}>
    <BM t={T.T4E2_Vrec4} />
    <IB label="Raison"><IM t="q=\frac{1}{2},\;V_0=\ln(e^2)-1=1" /></IB>
    <RB><BM t={T.T4E2_Vn4} /></RB>
  </Step>
  <Step index={2} title={<>Formule de <IM t="U_n" /> et limite</>}>
    <BM t={T.T4E2_Un4} /><RB><BM t={T.T4E2_lim4} /></RB>
  </Step>
</>)}

// ── T4-E3 ─────────────────────────────────────────────────────────────────────
const STATS4_PTS = [[0,450],[1,480],[2,520],[3,570],[4,630],[5,700],[6,780],[7,880]]
function T4E3() { return (<>
  <Step index={0} title="Ajustement affine">
    <div className="section-label">Nuage de points</div>
    <ScatterPlot
      points={STATS4_PTS}
      xLabel="Rang Xi" yLabel="Clients Yi"
      xmin={-0.5} xmax={7.5} ymin={400} ymax={900}
      xticks={[0,1,2,3,4,5,6,7]}
      yticks={[400,500,600,700,800,900]}
      title="Nuage de points (Années 2017-2024)"
    />
    <StatTable data={[
      { label: "Corrélation r", f: "r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X\\sigma_Y}", r: "\\approx 0{,}982" }
    ]} />
    <RB>{T.T4E3_rjust}</RB>
  </Step>
  <Step index={1} title="Ajustement exponentiel (z = ln y)">
    <StatTable data={[
      { label: "Droite de z en x", f: "z = ax + b", r: "z = 0{,}096x + 6{,}080" },
      { label: "Expression de y", f: "y = e^{ax+b}", r: "y \\approx 437e^{0{,}096x}" }
    ]} />
    <RB><BM t={T.T4E3_est2026} /></RB>
  </Step>
</>)}

// ── T4-E4 ─────────────────────────────────────────────────────────────────────
function T4E4() { return (<>
  <Step index={0} title="Identification de la primitive">
    <IB label="Analyse"><BM t={T.T4E4_prim} /></IB>
  </Step>
  <Step index={1} title="Lecture Graphique">
    <IB label="Valeurs et Dérivées"><BM t={T.T4E4_lect1} /></IB>
    <IB label="Limites"><BM t={T.T4E4_lect2} /></IB>
    <IB label="Valeur exacte"><BM t={T.T4E4_val} /></IB>
    <div className="section-label">Tableau de variation de f</div>
    <VariationTable
      xVals={[{ tex: '0' }, { tex: 'e' }, { tex: '+\\infty' }]}
      signs={['+', '-']}
      arrows={['up', 'down']}
      fVals={[{ tex: '-\\infty', pos: 'bot' }, { tex: '\\frac{4}{e}+1', pos: 'top' }, { tex: '1', pos: 'bot' }]}
    />
  </Step>
  <Step index={2} title="Équation f(x) = 0">
    <IB label="Théorème des Valeurs Intermédiaires"><BM t={T.T4E4_TVI} /></IB>
    <RB>f(x) &lt; 0 sur ]0;α[ et f(x) &gt; 0 sur ]α;+∞[ ✓</RB>
  </Step>
  <Step index={3} title="Primitive et Aire">
    <IB label="Vérification de F"><BM t={T.T4E4_F} /></IB>
    <IB label="Calcul de l'intégrale"><BM t={T.T4E4_I} /></IB>
    <RB><BM t={T.T4E4_I2} /></RB>
  </Step>
</>)}

// ── T5-E1 ─────────────────────────────────────────────────────────────────────
function T5E1() { return (<>
  <Step index={0} title={<>Déterminant de <IM t="A" /></>}>
    <p><IM t={T.T5E1_matA5} /></p><BM t={T.T5E1_detA5} />
    <RB><IM t="\det(A)=-2\neq0" /> ⟹ <strong>inversible</strong> ✓</RB>
  </Step>
  <Step index={1} title={<>Calcul de <IM t="A\times B" /> et <IM t="A^{-1}" /></>}>
    <BM t={T.T5E1_AB5} /><RB><BM t={T.T5E1_Ainv5} /></RB>
  </Step>
  <Step index={2} title={<>Déterminer <IM t="a,b,c" /> de <IM t="f(x)=ax^2+bx+c" /></>}>
    <IB label="Système">Conditions <IM t="f(1)=-1,\;f(2)=2,\;f(3)=0" /></IB>
    <BM t={T.T5E1_sys5} /><BM t={T.T5E1_Xsol5} /><BM t={T.T5E1_XR5} />
    <RB><BM t={T.T5E1_abc5} /></RB>
  </Step>
  <Step index={3} title="Expression de f(x)">
    <RB><BM t={T.T5E1_f5} /></RB>
  </Step>
</>)}

// ── T5-E2 ─────────────────────────────────────────────────────────────────────
const STATS5_PTS = [[1,10],[2,11],[3,14],[4,18],[5,22]]
function T5E2() { return (<>
  <Step index={0} title="Ajustement affine">
    <div className="section-label">Nuage de points</div>
    <ScatterPlot
      points={STATS5_PTS}
      xLabel="Rang Xi" yLabel="Touristes Yi"
      xmin={0} xmax={6} ymin={8} ymax={24}
      xticks={[1,2,3,4,5]}
      yticks={[10,12,14,16,18,20,22,24]}
      lines={[{ a: 3.1, b: 5.7, color: '#e0296e' }]}
      title="Nuage de points (Années 2018-2022) et droite d'ajustement"
    />
    <IB label="Corrélation"><BM t={T.T5E2_r} /></IB>
    <RB>{T.T5E2_rjust}</RB>
  </Step>
  <Step index={1} title="Droite de régression et Estimation">
    <IB label="Équation de la droite"><BM t={T.T5E2_D} /></IB>
    <RB><BM t={T.T5E2_est2025} /></RB>
  </Step>
</>)}

// ── T5-E3 ─────────────────────────────────────────────────────────────────────
function T5E3() { return (<>
  <Step index={0} title="Analyse du graphe">
    <IB label="Connexité"><BM t={T.T5E3_conx} /></IB>
    <RB><BM t={T.T5E3_deg8} /></RB>
  </Step>
  <Step index={1} title="Chemins dans le graphe">
    <RB>Chemin de (1) à (6) de longueur 3 : <BM t={T.T5E3_ch3} /></RB>
  </Step>
</>)}

// ── T5-E4 ─────────────────────────────────────────────────────────────────────
function T5E4() { return (<>
  <Step index={0} title={<>Matrices <IM t="A" /> et <IM t="B" /></>}>
    <IB label="Déterminant de A"><BM t={T.T5E4_detA} /></IB>
    <IB label="Produit A×B"><BM t={T.T5E4_AB} /></IB>
    <RB><BM t={T.T5E4_Ainv} /></RB>
  </Step>
  <Step index={1} title="Lecture Graphique">
    <IB label="Valeurs aux points A et B"><BM t={T.T5E4_lect} /></IB>
    <RB><BM t={T.T5E4_lims} /></RB>
  </Step>
  <Step index={2} title="Tangente T">
    <RB><BM t={T.T5E4_T} /></RB>
  </Step>
  <Step index={3} title="Dérivées et Système">
    <IB label="Dérivée f'(x)"><BM t={T.T5E4_fp} /></IB>
    <IB label="Dérivée seconde f''(x)"><BM t={T.T5E4_fpp} /></IB>
    <IB label="Écriture matricielle de (S)"><BM t={T.T5E4_Smat} /></IB>
    <IB label="Solution"><BM t={T.T5E4_Sol} /></IB>
    <RB>Expression finale : <BM t={T.T5E4_f} /> ✓</RB>
  </Step>
</>)}

// ── T6-E1 ─────────────────────────────────────────────────────────────────────
function T6E1() { return (<>
  <Step index={0} title={<>Matrice <IM t="A" /> et déterminant</>}>
    <IB label="Calcul"><BM t={T.T6E1_detA} /></IB>
    <RB><BM t={T.T6E1_invCond} /></RB>
  </Step>
  <Step index={1} title={<>Cas <IM t="a=3" /> : Matrice Inverse</>}>
    <BM t={T.T6E1_A3} />
    <RB><BM t={T.T6E1_Ainv} /></RB>
  </Step>
  <Step index={2} title={<>Résolution de (S)</>}>
    <BM t={T.T6E1_SysS} />
    <RB><BM t={T.T6E1_SolS} /></RB>
  </Step>
  <Step index={3} title={<>Résolution de (S')</>}>
    <BM t={T.T6E1_Sp_z} /><BM t={T.T6E1_Sp_L2} /><BM t={T.T6E1_Sp_L3} />
    <p>On retrouve le système (S) en x et y :</p>
    <RB><BM t={T.T6E1_SolSp} /></RB>
  </Step>
</>)}

// ── T6-E2 ─────────────────────────────────────────────────────────────────────
function T6E2() { return (<>
  <Step index={0} title={<>Vérification et Récurrence sur <IM t="U_n" /></>}>
    <IB label="Vérification algébrique"><BM t={T.T6E2_U1} /></IB>
    <IB label="Initialisation (n=0)"><BM t={T.T6E2_Init} /></IB>
    <IB label="Hérédité"><BM t={T.T6E2_Hered} /></IB>
  </Step>
  <Step index={1} title="Décroissance et Convergence">
    <IB label="Différence"><BM t={T.T6E2_Decr} /></IB>
    <RB><BM t={T.T6E2_Lim1} /></RB>
  </Step>
  <Step index={2} title={<>Suite auxiliaire <IM t="V_n = \ln(U_n+2)" /></>}>
    <BM t={T.T6E2_Vrec} />
    <IB label="Nature"><IM t="(V_n)" /> est arithmétique de raison <IM t="r=-\ln(2)" /></IB>
    <RB><BM t={T.T6E2_Vn} /></RB>
  </Step>
  <Step index={3} title={<>Expression finale de <IM t="U_n" /> et limite</>}>
    <BM t={T.T6E2_Un2} />
    <RB><BM t={T.T6E2_Lim2} /></RB>
  </Step>
</>)}

// ── T6-E3 ─────────────────────────────────────────────────────────────────────
function T6E3() { return (<>
  <Step index={0} title="Probabilités conditionnelles">
    <IB label="Données de l'énoncé"><BM t={T.T6E3_PAB} /></IB>
    <IB label="Calculs de base"><BM t={T.T6E3_PA} /></IB>
    <RB><BM t={T.T6E3_Indep} /></RB>
  </Step>
  <Step index={1} title="Probabilités simples">
    <IB label="P(Com | Info)"><BM t={T.T6E3_PBA} /></IB>
    <IB label="P(Un seul stage)"><BM t={T.T6E3_UnSeul} /></IB>
  </Step>
  <Step index={2} title="Loi binomiale (n=4)">
    <BM t={T.T6E3_Binom} />
    <IB label="P(X=2)"><BM t={T.T6E3_PX2} /></IB>
    <RB><BM t={T.T6E3_EX} /></RB>
  </Step>
</>)}

// ── T6-E4 ─────────────────────────────────────────────────────────────────────
function T6E4() { 
  const f64 = x => (x-2)*Math.exp(x) + 1
  return (<>
  <div className="info-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1', marginBottom: '1.5rem', borderWidth: '1px' }}>
    <div className="info-label" style={{ color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
      Énoncé de l'exercice
    </div> 
    <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
      Soit <IM t="f" /> la fonction définie sur <IM t="\mathbb{R}" /> par : <BM t="f(x) = (x-2)e^x + 1" />
    </p>
  </div>

  <Step index={0} title="Limites et Asymptotes">
    <IB label="En +∞"><BM t={T.T6E4_LimInf} /></IB>
    <IB label="En -∞"><BM t={T.T6E4_LimMoins} /></IB>
  </Step>
  <Step index={1} title="Dérivée et Tableau de variation">
    <IB label="Dérivée f'(x)"><BM t={T.T6E4_Deriv} /></IB>
    <IB label="Signe de f'(x)"><BM t={T.T6E4_Signe} /></IB>
    <div className="section-label">Tableau de variation</div>
    <VariationTable
      xVals={[{ tex: '-\\infty' }, { tex: '1' }, { tex: '+\\infty' }]}
      signs={['-', '+']}
      arrows={['down', 'up']}
      fVals={[{ tex: '1', pos: 'top' }, { tex: '1-e', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
    />
    <RB>Minimum en <IM t="x=1" /> : <BM t="f(1)=(1-2)e+1=1-e\approx-1{,}72" /></RB>
  </Step>
  <Step index={2} title="Point d'inflexion A">
    <IB label="Dérivée seconde"><BM t={T.T6E4_Inflex} /></IB>
    <RB><IM t="f''(x)=xe^x" /> s'annule et change de signe en <IM t="x=0" /> ⟹ <strong>Point d'inflexion</strong> <IM t="A(0\,;\,-1)" /></RB>
  </Step>
  <Step index={3} title={<>Équation <IM t="f(x)=0" /> — solution <IM t="\alpha" /></>}>
    <IB label="TVI"><BM t={T.T6E4_TVI} /></IB>
    <RB><IM t="1{,}8 < \alpha < 1{,}9" /> ✓</RB>
  </Step>
  <Step index={4} title="Primitive F et Intégrale I">
    <IB label="Vérification de F(x)=(x-3)eˣ+x"><BM t={T.T6E4_Prim} /></IB>
    <RB><BM t={T.T6E4_Int} /></RB>
  </Step>
  <Step index={5} title="Application Économique">
    <div className="info-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1', marginBottom: '1.5rem', borderWidth: '1px' }}>
      <div className="info-label" style={{ color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
        Application économique
      </div> 
      <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
        Une entreprise produit chaque jour <IM t="x" /> centaines d'objets (<IM t="1 \le x \le 3" />). 
        Le bénéfice réalisé en milliers de dinars est modélisé par la fonction <IM t="f" /> pour <IM t="x \in [1,3]" />.
      </p>
    </div>
    <div className="section-label">Tracé de f(x) (Bénéfice)</div>
    <FunctionCurve
      fn={f64}
      xmin={-3} xmax={3} ymin={-2} ymax={4}
      xticks={[-2,-1,0,1,2,3]} yticks={[-2,-1,0,1,2,3,4]}
      title="(C): f(x) = (x-2)e^x + 1"
      extra={[{ type:'hline', y:0, color:'#94a3b8' }]}
    />
    <IB label="Bénéfice (200 objets)"><BM t={T.T6E4_Ben1} /></IB>
    <IB label="Seuil de rentabilité"><BM t={T.T6E4_Ben2} /></IB>
    <RB><BM t={T.T6E4_Ben3} /></RB>
  </Step>
</>)}
// ── T7-E1 ─────────────────────────────────────────────────────────────────────
function T7E1() { return (<>
  <Step index={0} title={<>Matrice <IM t="A" /> et inverse</>}>
    <IB label="Matrice A"><BM t={T.T7E1_A} /></IB>
    <IB label="Déterminant"><BM t={T.T7E1_detA} /></IB>
    <IB label="Produit A × B"><BM t={T.T7E1_B} /><BM t={T.T7E1_AB} /></IB>
    <RB><BM t={T.T7E1_Ainv} /></RB>
  </Step>
  <Step index={1} title="Mise en équation">
    <IB label="Réductions">Chemise (-10%), Pantalon (-40%), Pull (-30%)</IB>
    <IB label="Valeur des réductions">0.1x + 0.4y + 0.3z = 82 ⟹ x + 4y + 3z = 820</IB>
    <RB><BM t={T.T7E1_SysS} /></RB>
  </Step>
  <Step index={2} title="Résolution matricielle">
    <BM t={T.T7E1_MatS} />
    <IB label="Calcul"><BM t={T.T7E1_SolS} /></IB>
    <RB><BM t={T.T7E1_Prix} /></RB>
  </Step>
  <Step index={3} title="Période de liquidation">
    <BM t={T.T7E1_Liq1} />
    <RB><BM t={T.T7E1_Liq2} /></RB>
  </Step>
</>)}

// ── T7-E2 ─────────────────────────────────────────────────────────────────────
function T7E2() { return (<>
  <Step index={0} title="Analyse du graphe orienté">
    <RB><BM t={T.T7E2_Ori} /></RB>
  </Step>
  <Step index={1} title="Degrés et chaînes eulériennes">
    <GraphDegTable
      nodes={['A', 'B', 'C', 'D', 'E', 'F', 'G']}
      dPlus={[3, 1, 2, 1, 3, 2, 3]}
      dMinus={[3, 1, 2, 2, 2, 2, 3]}
    />
    <IB label="Circuit eulérien ?"><BM t={T.T7E2_CircEul} /></IB>
    <RB><BM t={T.T7E2_ChnEul} /></RB>
  </Step>
  <Step index={2} title="Chemins et matrices">
    <IB label="De E à D (longueur 2)"><BM t={T.T7E2_Chm2} /></IB>
    <IB label="De G à A (longueur 3)"><BM t={T.T7E2_Chm3} /></IB>
    <IB label="De B à C (longueur 2)"><BM t={T.T7E2_Chm2B} /></IB>
    <RB><BM t={T.T7E2_ChmF} /></RB>
  </Step>
  <Step index={3} title="Diamètre du graphe">
    <IB label="Puissances 2 et 3"><BM t={T.T7E2_Diam1} /></IB>
    <RB><BM t={T.T7E2_Diam2} /></RB>
  </Step>
</>)}

// ── T7-E3 ─────────────────────────────────────────────────────────────────────
const STATS7_Y_PTS = [[0.30,6.25],[0.35,4.90],[0.45,3.75],[0.65,2.75],[0.80,2.40],[1.00,2.25]]
function T7E3() { return (<>
  <Step index={0} title="Ajustement de la Demande (Y)">
    <div className="section-label">Nuage de points de la Demande</div>
    <ScatterPlot
      points={STATS7_Y_PTS}
      xLabel="Prix X (DT)" yLabel="Demande Y (k-kg)"
      xmin={0} xmax={1.2} ymin={0} ymax={7}
      xticks={[0.2,0.4,0.6,0.8,1.0]} yticks={[0,2,4,6]}
      lines={[{ a: -5.196, b: 6.791, color: '#e0296e' }]}
      title="Nuage de points et droite de régression D1"
    />
    <StatTable data={[
      { label: "Corrélation r", f: "r(X,Y)", r: "\\approx -0{,}897" },
      { label: "Droite D1", f: "Y = aX + b", r: "Y = -5{,}196 X + 6{,}791" }
    ]} />
    <RB><BM t={T.T7E3_Est} /></RB>
  </Step>
  <Step index={1} title="Ajustement de l'Offre (Z)">
    <IB label="Corrélation Z/X"><BM t={T.T7E3_r2} /></IB>
  </Step>
  <Step index={2} title="Prix d'équilibre">
    <p>Le point d'équilibre correspond à l'égalité Offre = Demande.</p>
    <BM t={T.T7E3_Eq1} />
    <RB><BM t={T.T7E3_Eq2} /></RB>
  </Step>
</>)}

// ── T7-E4 ─────────────────────────────────────────────────────────────────────
function T7E4() { 
  const f74 = x => (x + 1 - Math.log(x))/x
  return (<>
  <div className="info-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1', marginBottom: '1.5rem', borderWidth: '1px' }}>
    <div className="info-label" style={{ color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
      Énoncé de l'exercice
    </div> 
    <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
      Soit <IM t="f" /> la fonction définie sur l'intervalle <IM t="]0, +\infty[" /> par : <BM t="f(x) = \frac{x+1-\ln x}{x}" />
      On note <IM t="(C)" /> la courbe de <IM t="f" /> dans un repère orthonormé <IM t="(O, \vec{i}, \vec{j})" />.
    </p>
  </div>

  <Step index={0} title="Limites et Asymptotes">
    <IB label="En 0⁺"><BM t={T.T7E4_Lim0} /></IB>
    <IB label="En +∞"><BM t={T.T7E4_LimInf} /></IB>
  </Step>
  <Step index={1} title="Dérivabilité et f'(x)">
    <p><IM t="f" /> est dérivable sur <IM t="]0\,;+\infty[" /> comme quotient de fonctions dérivables.</p>
    <IB label="Calcul de f'(x)"><BM t={T.T7E4_Deriv} /></IB>
    <IB label="Analyse du signe"><BM t={T.T7E4_Tab} /></IB>
    <div className="section-label">Tableau de variation</div>
    <VariationTable
      xVals={[{ tex: '0' }, { tex: 'e^2' }, { tex: '+\\infty' }]}
      signs={['-', '+']}
      arrows={['down', 'up']}
      fVals={[{ tex: '+\\infty', pos: 'top' }, { tex: '\\frac{e^2-1}{e^2}', pos: 'bot' }, { tex: '1', pos: 'top' }]}
    />
  </Step>
  <Step index={2} title={<>Équation <IM t="f(x)=\frac{3}{2}" /> — solution <IM t="\alpha" /></>}>
    <p><IM t="f" /> est continue et strictement décroissante sur <IM t="]0\,;e^2]" />.</p>
    <IB label="Encadrement de α"><BM t={T.T7E4_TVI} /></IB>
    <RB><IM t="\alpha\in\,]1{,}36\,;\,1{,}38[" /> ✓</RB>
  </Step>
  <Step index={3} title="Tangente T au point d'abscisse 1">
    <IB label="Valeurs"><BM t="f(1)=2\text{ et }f'(1)=\frac{\ln 1-2}{1}=-2" /></IB>
    <RB><BM t={T.T7E4_Tang} /></RB>
  </Step>
  <Step index={4} title="Courbe (C) et Tangente T">
    <div className="section-label">Tracé de f(x) avec asymptote y=1 et tangente</div>
    <FunctionCurve
      fn={f74}
      xmin={0.1} xmax={15} ymin={0} ymax={4}
      xticks={[2,4,6,8,10,12,14]} yticks={[0,1,2,3,4]}
      title="(C): f(x) = (x+1-ln(x))/x  —  Tangente T: y=-2x+4"
      extra={[
        { type:'hline', y:1, color:'#94a3b8', dash:true },
        { type:'fn', fn: x => -2*x+4, color:'#e0296e', dash:true }
      ]}
    />
  </Step>
  <Step index={5} title="Primitive F et Intégrale I">
    <IB label="Vérification de F"><BM t={T.T7E4_Prim} /></IB>
    <RB><BM t={T.T7E4_Int} /></RB>
  </Step>
  <Step index={6} title="Application Économique">
    <div className="info-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1', marginBottom: '1.5rem', borderWidth: '1px' }}>
      <div className="info-label" style={{ color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
        Application économique
      </div> 
      <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
        Une entreprise fabrique chaque jour entre 100 et 1000 pièces électroniques pour des vidéoprojecteurs. Toutes les pièces fabriquées sont identiques. 
        On admet que lorsque <IM t="x" /> centaines de pièces sont fabriquées (<IM t="1 \le x \le 10" />), 
        le coût de fabrication d'une pièce est de <IM t="f(x)" /> en dinars.
      </p>
    </div>
    <IB label="Coût minimal (pièces optimales)"><BM t={T.T7E4_Ben1} /></IB>
    <IB label="Coût ≤ 1,5 DT"><BM t={T.T7E4_Ben2} /></IB>
    <RB><BM t={T.T7E4_Ben3} /></RB>
  </Step>
</>)}

// ── T8-E1 ─────────────────────────────────────────────────────────────────────
function T8E1() { return (<>
  <Step index={0} title="Inversibilité et Matrice Inverse">
    <IB label="Déterminant de A"><BM t={T.T8E1_detA} /></IB>
    <IB label="Produit A × B"><BM t={T.T8E1_AB} /></IB>
    <RB><BM t={T.T8E1_Ainv} /></RB>
  </Step>
  <Step index={1} title="Mise en équation du coût (AU = V)">
    <IB label="Système"><BM t={T.T8E1_SysV} /></IB>
    <IB label="Cas U donné"><BM t={T.T8E1_U2} /></IB>
    <RB><BM t={T.T8E1_Coût} /></RB>
  </Step>
  <Step index={2} title="Résolution (Trouver U)">
    <BM t={T.T8E1_Uinv} />
    <IB label="Calcul matriciel"><BM t={T.T8E1_USol} /></IB>
    <RB><BM t={T.T8E1_Jours} /></RB>
  </Step>
</>)}

// ── T8-E2 ─────────────────────────────────────────────────────────────────────
function T8E2() { return (<>
  <Step index={0} title="Probabilités simples">
    <IB label="Données"><BM t={T.T8E2_P} /></IB>
    <IB label="P(Au moins un défaut)"><BM t={T.T8E2_D} /></IB>
    <IB label="P(Un seul défaut)"><BM t={T.T8E2_E} /></IB>
    <IB label="P(Sans défaut)"><BM t={T.T8E2_F} /></IB>
  </Step>
  <Step index={1} title="Probabilité conditionnelle">
    <RB><BM t={T.T8E2_Cond} /></RB>
  </Step>
  <Step index={2} title="Tirage avec remise">
    <BM t={T.T8E2_Bin} />
    <RB><BM t={T.T8E2_PUnS} /></RB>
  </Step>
  <Step index={3} title="Variable aléatoire (Prix de vente)">
    <IB label="Loi de X"><BM t={T.T8E2_Loi} /></IB>
    <IB label="Espérance E(X)"><BM t={T.T8E2_Esp} /></IB>
    <RB><BM t={T.T8E2_CA} /></RB>
  </Step>
</>)}

// ── T8-E3 ─────────────────────────────────────────────────────────────────────
function T8E3() { return (<>
  <Step index={0} title="Suite auxiliaire">
    <IB label="Preuve V_n géométrique"><BM t={T.T8E3_Vrec} /></IB>
    <RB><BM t={T.T8E3_Vgeom} /></RB>
  </Step>
  <Step index={1} title="Expression et Limite">
    <IB label="U_n en fonction de n"><BM t={T.T8E3_VnUn} /></IB>
    <RB><BM t={T.T8E3_Lim} /></RB>
  </Step>
  <Step index={2} title="Application (Abonnés > 7900)">
    <IB label="Inéquation"><BM t={T.T8E3_InEq} /></IB>
    <IB label="Logarithme"><BM t={T.T8E3_Ln} /></IB>
    <RB><BM t={T.T8E3_Annee} /></RB>
  </Step>
  <Step index={3} title="Dépassement de 8000 ?">
    <RB><BM t={T.T8E3_Imp} /></RB>
  </Step>
</>)}

// ── T8-E4 ─────────────────────────────────────────────────────────────────────
function T8E4() { 
  const f84 = x => x + Math.exp(-x)
  return (<>
  <Step index={0} title="Limites en -∞">
    <BM t={T.T8E4_LimM1} />
    <IB label="Limite de f(x)"><BM t={T.T8E4_LimM2} /></IB>
    <IB label="Branche Parabolique"><BM t={T.T8E4_LimM3} /></IB>
  </Step>
  <Step index={1} title="Limite en +∞ et Asymptote oblique">
    <RB><BM t={T.T8E4_LimP} /></RB>
  </Step>
  <Step index={2} title="Dérivée et Tableau de Variation">
    <IB label="Dérivée f'(x)"><BM t={T.T8E4_Deriv} /></IB>
    <IB label="Signe"><BM t={T.T8E4_Signe} /></IB>
    <div className="section-label">Tableau de variation</div>
    <VariationTable
      xVals={[{ tex: '-\\infty' }, { tex: '0' }, { tex: '+\\infty' }]}
      signs={['-', '+']}
      arrows={['down', 'up']}
      fVals={[{ tex: '+\\infty', pos: 'top' }, { tex: '1', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
    />
  </Step>
  <Step index={3} title="Tracé de la courbe">
    <div className="section-label">Courbe (C) et Asymptote Δ</div>
    <FunctionCurve
      fn={f84}
      xmin={-3} xmax={4} ymin={0} ymax={5}
      xticks={[-2,-1,0,1,2,3,4]} yticks={[0,1,2,3,4,5]}
      title="(C): f(x) = x + e^{-x}"
      extra={[{ type:'line', f:x=>x, color:'#e0296e', dash:true }]}
    />
  </Step>
  <Step index={4} title="Calcul d'Aire">
    <RB><BM t={T.T8E4_Int} /></RB>
  </Step>
</>)}

// ── T9-E1 ─────────────────────────────────────────────────────────────────────
function T9E1() { return (<>
  <Step index={0} title="Probabilités et événements croisés">
    <IB label="Données de base"><BM t={T.T9E1_PA} /></IB>
    <IB label="Calcul de l'intersection"><BM t={T.T9E1_PAB} /></IB>
    <RB><BM t={T.T9E1_PBA} /></RB>
  </Step>
  <Step index={1} title="Probabilité conditionnelle et arbre">
    <IB label="Formule p(A|B̄)"><BM t={T.T9E1_Cond} /></IB>
    <IB label="Probabilité X = 2"><BM t={T.T9E1_PX2} /></IB>
    <RB><BM t={T.T9E1_EX} /></RB>
  </Step>
</>)}

// ── T9-E2 ─────────────────────────────────────────────────────────────────────
function T9E2() { return (<>
  <Step index={0} title="Matrice Inverse">
    <IB label="Déterminant"><BM t={T.T9E2_detA} /></IB>
    <RB><BM t={T.T9E2_AB} /></RB>
  </Step>
  <Step index={1} title="Fractions rationnelles et Système">
    <IB label="Mise au même dénominateur"><BM t={T.T9E2_Frac1} /></IB>
    <RB><BM t={T.T9E2_Frac2} /></RB>
  </Step>
  <Step index={2} title="Résolution avec la matrice inverse">
    <IB label="Écriture matricielle"><BM t={T.T9E2_Mat} /></IB>
    <RB><BM t={T.T9E2_Sol} /></RB>
  </Step>
  <Step index={3} title="Calcul de l'Intégrale">
    <IB label="Primitive des fractions"><BM t={T.T9E2_Int} /></IB>
    <RB><BM t={T.T9E2_IntCalc} /></RB>
  </Step>
</>)}

// ── T9-E3 ─────────────────────────────────────────────────────────────────────
function T9E3() { return (<>
  <Step index={0} title="Lecture Graphique (Fonction et Dérivée)">
    <IB label="Lecture de g(1)"><BM t={T.T9E3_g1} /></IB>
    <RB><BM t={T.T9E3_Inflex} /></RB>
  </Step>
  <Step index={1} title="Tangente Horizontale">
    <RB><BM t={T.T9E3_f1} /></RB>
  </Step>
  <Step index={2} title="Calcul d'Intégrale de f(x)g(x)">
    <RB><BM t={T.T9E3_Int} /></RB>
  </Step>
  <Step index={3} title="Valeur Moyenne de f">
    <RB><BM t={T.T9E3_ValMoy} /></RB>
  </Step>
</>)}

// ── T9-E4 ─────────────────────────────────────────────────────────────────────
function T9E4() { return (<>
  <Step index={0} title="Graphe et Chaîne Eulérienne">
    <IB label="Ordre et Arêtes"><BM t={T.T9E4_Ordre} /></IB>
    <GraphDegTable nodes={['A', 'B', 'C', 'D', 'E']} d={[4, 3, 3, 4, 2]} />
    <RB><BM t={T.T9E4_Eul} /></RB>
  </Step>
  <Step index={1} title="Nombre chromatique">
    <IB label="Sous-graphe"><BM t={T.T9E4_SousG} /></IB>
    <IB label="Borne supérieure"><BM t={T.T9E4_Max} /></IB>
    <RB><BM t={T.T9E4_n4} /></RB>
  </Step>
  <Step index={2} title="Chaînes de longueur 4 (Matrice d'adjacence)">
    <RB><BM t={T.T9E4_Chm} /></RB>
  </Step>
</>)}

// ── T10-E1 ────────────────────────────────────────────────────────────────────
const STATS10_Y_PTS = [[1,45.13],[2,53.46],[3,66.15],[4,78.72],[5,80.83],[6,86.67]]
function T10E1() { return (<>
  <Step index={0} title="Ajustement de la dette (Y en fonction de X)">
    <div className="section-label">Nuage de points des dettes</div>
    <ScatterPlot
      points={STATS10_Y_PTS}
      xLabel="Rang de l'année (x)" yLabel="Dette (y)"
      xmin={0} xmax={9} ymin={40} ymax={120}
      xticks={[1,2,3,4,5,6,7,8]} yticks={[40,60,80,100,120]}
      lines={[{ a: 8.64, b: 38.26, color: '#e0296e' }]}
      title="Nuage de points et droite de régression D"
    />
    <StatTable data={[
      { label: "Corrélation r", f: "r(X,Y)", r: "\\approx 0{,}978" },
      { label: "Droite D", f: "y = ax + b", r: "y = 8{,}64x + 38{,}26" }
    ]} />
  </Step>
  <Step index={1} title="Estimations pour 2022">
    <IB label="Par ajustement affine"><BM t={T.T10E1_EstAff} /></IB>
    <IB label="Par ajustement exponentiel"><BM t={T.T10E1_EstExp} /></IB>
  </Step>
  <Step index={2} title="Comparaison avec le réel">
    <RB><BM t={T.T10E1_Comp} /></RB>
  </Step>
</>)}

// ── T10-E2 ────────────────────────────────────────────────────────────────────
function T10E2() { return (<>
  <Step index={0} title="Déterminant et Inversibilité">
    <IB label="Calcul de det(M_α)"><BM t={T.T10E2_det} /></IB>
    <RB><BM t={T.T10E2_inv} /></RB>
  </Step>
  <Step index={1} title="Matrice Inverse pour α=4">
    <IB label="Calcul de A × B"><BM t={T.T10E2_AB} /></IB>
    <RB><BM t={T.T10E2_Ainv} /></RB>
  </Step>
  <Step index={2} title="Résolution du système">
    <IB label="Écriture matricielle"><BM t={T.T10E2_Sys} /></IB>
    <RB><BM t={T.T10E2_Sol} /></RB>
  </Step>
  <Step index={3} title="Problème de la confiserie">
    <IB label="Modélisation"><BM t={T.T10E2_Prob} /></IB>
    <RB><BM t={T.T10E2_Rep} /></RB>
  </Step>
</>)}

// ── T10-E3 ────────────────────────────────────────────────────────────────────
function T10E3() { 
  const f10 = x => Math.exp(x) - Math.log(x)
  return (<>
  <Step index={0} title="Étude de la fonction auxiliaire g">
    <IB label="Dérivée g'(x)"><BM t={T.T10E3_gDeriv} /></IB>
    <IB label="Application du TVI"><BM t={T.T10E3_TVI} /></IB>
    <RB><BM t={T.T10E3_gSign} /></RB>
  </Step>
  <Step index={1} title="Étude de f et Limites">
    <IB label="Limite en 0⁺"><BM t={T.T10E3_Lim0} /></IB>
    <IB label="Limite en +∞"><BM t={T.T10E3_LimInf} /></IB>
  </Step>
  <Step index={2} title="Dérivée et Tableau de variation de f">
    <IB label="Calcul de f'(x)"><BM t={T.T10E3_fDeriv} /></IB>
    <IB label="Variations"><BM t={T.T10E3_Var} /></IB>
    <div className="section-label">Tableau de variation de f</div>
    <VariationTable
      xVals={[{ tex: '0' }, { tex: '\\alpha' }, { tex: '+\\infty' }]}
      signs={['-', '+']}
      arrows={['down', 'up']}
      fVals={[{ tex: '+\\infty', pos: 'top' }, { tex: 'f(\\alpha)', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
    />
  </Step>
  <Step index={3} title="Courbe et Distance MN">
    <div className="section-label">Tracé de f(x) = e^x - ln(x)</div>
    <FunctionCurve
      fn={f10}
      xmin={0.1} xmax={3} ymin={0} ymax={20}
      xticks={[0.5,1,1.5,2,2.5,3]} yticks={[0,5,10,15,20]}
      title="(C): f(x) = e^x - ln(x)"
    />
    <IB label="Distance verticale MN"><BM t={T.T10E3_MN1} /></IB>
    <RB><BM t={T.T10E3_MN2} /></RB>
  </Step>
</>)}

// ── T10-E4 ────────────────────────────────────────────────────────────────────
function T10E4() { return (<>
  <Step index={0} title="Graphe et parcours piéton">
    <IB label="Analyse"><BM t={T.T10E4_Ordre} /></IB>
    <GraphDegTable nodes={['A', 'B', 'C', 'D', 'E']} d={[4, 3, 3, 4, 2]} />
    <RB><BM t={T.T10E4_Piéton} /></RB>
  </Step>
  <Step index={1} title="Sous-graphe complet et Coloriage">
    <IB label="Recherche de K_n"><BM t={T.T10E4_SousG} /></IB>
    <RB><BM t={T.T10E4_nVal} /></RB>
  </Step>
  <Step index={2} title="Graphe orienté et chaînes">
    <RB><BM t={T.T10E4_Chm} /></RB>
  </Step>
</>)}

// ── TEST 1 ────────────────────────────────────────────────────────────────────
function TEST1E1() { return (<>
  <Step index={0} title="Fonctions Exponentielles — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\lim_{x\\to-\\infty}f(x)=-1 \\quad 2)\\;f'(x)=(x^2+x-1)e^x \\quad 3)\\;e^{1+2\\ln2}-e^{1-\\ln2}=\\frac{7e}{2}"} />
  </IB><RB><BM t={"4)\\;\\int_0^1 2e^{-2x}\\,dx = 1-e^{-2}"} /></RB></Step>
</>)}
function TEST1E2() { return (<>
  <Step index={0} title="Graphes et Matrices — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\text{Non orienté}\\quad 2)\\;5\\text{ arêtes}\\quad 3)\\;\\text{Non, 2 sommets impairs}"} />
  </IB><RB><BM t={"4)\\;M^2 \\text{ = nombre de chaînes de longueur 2}"} /></RB></Step>
</>)}
function TEST1E3() { return (<>
  <Step index={0} title="Probabilités — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;p(A\\cap B)=0{,}08\\quad 2)\\;p(A\\cup B)=0{,}62\\quad 3)\\;p=0{,}4"} />
  </IB><RB><BM t={"4)\\;p(X=1)=\\tfrac{54}{125}"} /></RB></Step>
</>)}
function TEST1E4() { return (<>
  <Step index={0} title="Statistiques — QCM">
    <StatTable data={[
      { label: "1) Droite", f: "Y = aX+b", r: "Y=3{,}5X+2{,}3" },
      { label: "2) Coefficient", f: "a", r: "a=3{,}5" },
      { label: "3) Ajustement", r: "\\text{Ajustement fort}" },
      { label: "4) Estimation", f: "Y(5)", r: "19{,}8" }
    ]} />
  </Step>
</>)}
function TEST1E5() { return (<>
  <Step index={0} title="Suites Numériques — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;V_0=-4\\quad 2)\\;q=\\tfrac{1}{3}\\quad 3)\\;V_n=-4\\times(\\tfrac{1}{3})^n"} />
  </IB><RB><BM t={"4)\\;\\lim U_n = 6"} /></RB></Step>
</>)}

// ── TEST 2 ────────────────────────────────────────────────────────────────────
function TEST2E1() { return (<>
  <Step index={0} title="Fonctions Logarithmes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;0\\quad 2)\\;f'(x)=-\\frac{e^{-x}}{1+e^{-x}}\\quad 3)\\;\\ln(4e)+\\ln(e/2)-\\ln(2/e^2)=4"} />
  </IB><RB><BM t={"4)\\;\\int_1^e(1+\\tfrac{2}{x})dx = e-1+2"} /></RB></Step>
</>)}
function TEST2E2() { return (<>
  <Step index={0} title="Analyse Graphique — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;g'(-2)=4\\quad 2)\\;\\lim_{x\\to-\\infty}\\frac{g(x)}{x}=0\\quad 3)\\;\\lim_{x\\to+\\infty}(g(x)-x)=1"} />
  </IB><RB><BM t={"4)\\;\\text{La courbe coupe (Ox) 2 fois}"} /></RB></Step>
</>)}
function TEST2E3() { return (<>
  <Step index={0} title="Matrices et Systèmes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\det(A)=-1\\quad 2)\\;A(A+I_3)=\\begin{pmatrix}2&-1&0\\\\1&1&-1\\\\2&0&0\\end{pmatrix}"} />
  </IB><RB><BM t={"3)\\;\\text{Matrice de (S) correcte}\\quad 4)\\;1\\text{ solution unique}"} /></RB></Step>
</>)}
function TEST2E4() { return (<>
  <Step index={0} title="Suites Numériques — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;U_n=\\frac{2-n}{2}\\quad 2)\\;\\text{Décroissante}\\quad 3)\\;\\lim U_n=-\\infty"} />
  </IB><RB><BM t={"4)\\;\\lim_{n\\to+\\infty}n\\,e^{-n+1}=0"} /></RB></Step>
</>)}
function TEST2E5() { return (<>
  <Step index={0} title="Graphes Probabilistes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;P(B\\to A)=0{,}2\\quad 2)\\;P_1=(0{,}6\\;\\;0{,}4)\\quad 3)\\;\\text{État stable}: a=\\tfrac{1}{3},b=\\tfrac{2}{3}"} />
  </IB><RB><BM t={"4)\\;a+b=1 \\text{ toujours}"} /></RB></Step>
</>)}

// ── TEST 3 ────────────────────────────────────────────────────────────────────
function TEST3E1() { return (<>
  <Step index={0} title="Matrices ordre 3 — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\det(A)=8\\quad 2)\\;AX=\\begin{pmatrix}2\\\\3\\\\1\\end{pmatrix}\\quad 3)\\;X=A^{-1}\\begin{pmatrix}2\\\\3\\\\1\\end{pmatrix}"} />
  </IB><RB><BM t={"4)\\;A^{-1}=\\tfrac{1}{8}(3I_3-A)"} /></RB></Step>
</>)}
function TEST3E2() { return (<>
  <Step index={0} title="Théorie des Graphes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;d^+(A)=2\\quad 2)\\;\\text{Oui, }d^+(A)=d^-(A)\\quad 3)\\;1\\text{ chemin de long.2 de B vers C}"} />
  </IB><RB><BM t={"4)\\;6\\text{ arcs}"} /></RB></Step>
</>)}
function TEST3E3() { return (<>
  <Step index={0} title="Probabilités et Suites — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;E(X)=-0{,}5\\text{ DT}\\quad 2)\\;\\mathcal{B}(4;0{,}3)\\quad 3)\\;C_4^2(0{,}3)^2(0{,}7)^2"} />
  </IB><RB><BM t={"4)\\;\\lim U_n=3"} /></RB></Step>
</>)}
function TEST3E4() { return (<>
  <Step index={0} title="Analyse et Aires — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;F(0)=2,\\,F(2)=0\\quad 2)\\;C_F\\text{ admet une tangente horizontale}\\quad 3)\\;\\int_0^1 f(x)\\,dx"} />
  </IB><RB><BM t={"4)\\;\\mathcal{A}=e-2\\text{ u.a.}"} /></RB></Step>
</>)}
function TEST3E5() { return (<>
  <Step index={0} title="Statistiques — QCM">
    <StatTable data={[
      { label: "1) Moyenne", f: "\\bar{X}", r: "2" },
      { label: "2) Corrélation", f: "|r|", r: "\\approx 1" },
      { label: "3) Estimation", f: "Y(10)", r: "26" },
      { label: "4) Signe de r", r: "r\\text{ est positif}" }
    ]} />
  </Step>
</>)}

// ── TEST 4 ────────────────────────────────────────────────────────────────────
function TEST4E1() { return (<>
  <Step index={0} title="Matrices et Résolution — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\det(A)=4\\quad 2)\\;A^{-1}=\\tfrac{1}{4}(5I_3-A)\\quad 3)\\;\\text{Somme L1}=4"} />
  </IB><RB><BM t={"4)\\;(\\tfrac{1}{4},\\tfrac{1}{4},\\tfrac{1}{4})"} /></RB></Step>
</>)}
function TEST4E2() { return (<>
  <Step index={0} title="Graphes Probabilistes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;P_1=(0{,}55\\;\\;0{,}45)\\quad 2)\\;P=P\\times M\\quad 3)\\;a=0{,}6"} />
  </IB><RB><BM t={"4)\\;K_4\\text{ a 6 arêtes}"} /></RB></Step>
</>)}
function TEST4E3() { return (<>
  <Step index={0} title="Probabilités Conditionnelles — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;p(F\\cap L)=0{,}18\\quad 2)\\;p(L)=0{,}26\\quad 3)\\;p(F|L)\\approx 0{,}692"} />
  </IB><RB><BM t={"4)\\;1-(0{,}74)^3"} /></RB></Step>
</>)}
function TEST4E4() { return (<>
  <Step index={0} title="Analyse f(x)=xeˣ — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\lim_{x\\to-\\infty}xe^x=0\\quad 2)\\;F'(x)=xe^x\\quad 3)\\;\\text{minimum en }x=-1"} />
  </IB><RB><BM t={"4)\\;\\int_1^2 xe^x\\,dx = e^2"} /></RB></Step>
</>)}
function TEST4E5() { return (<>
  <Step index={0} title="Suites et Limites — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;W_n=3\\times(0{,}2)^n\\quad 2)\\;\\lim W_n=0\\quad 3)\\;\\lim S_n=\\tfrac{15}{4}\\text{ et }\\tfrac{3}{0{,}8}\\text{ (les deux)}"} />
  </IB><RB><BM t={"4)\\;n=4"} /></RB></Step>
</>)}

// ── TEST 5 ────────────────────────────────────────────────────────────────────
function TEST5E1() { return (<>
  <Step index={0} title="Analyse Graphique et Primitives — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\Delta: y=x-1\\quad 2)\\;\\lim(f(x)-(x-1))=0\\quad 3)\\;(\\mathcal{C})\\text{ est au dessus de }(\\Delta)"} />
  </IB><RB><BM t={"4)\\;F(x)=\\tfrac{1}{2}x^2-x+\\ln(x)"} /></RB></Step>
</>)}
function TEST5E2() { return (<>
  <Step index={0} title="Loi Binomiale — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;\\sigma(X)=1{,}2\\quad 2)\\;\\mathcal{B}(5;0{,}3)\\quad 3)\\;E(Y)=1{,}5"} />
  </IB><RB><BM t={"4)\\;P(Y=0)=(0{,}7)^5"} /></RB></Step>
</>)}
function TEST5E3() { return (<>
  <Step index={0} title="Suites et Matrices — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;V_n=U_n-6\\text{ géom. de raison }\\tfrac{1}{2}\\quad 2)\\;\\lim U_n=6\\quad 3)\\;\\det(A)=3"} />
  </IB><RB><BM t={"4)\\;\\text{1ère colonne de }A^{-1}=\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}"} /></RB></Step>
</>)}
function TEST5E4() { return (<>
  <Step index={0} title="Graphes — Dijkstra — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;X=8(B),\\,Y=9(C)\\quad 2)\\;d(A,F)=11\\quad 3)\\;\\text{Diamètre}=4"} />
  </IB><RB><BM t={"4)\\;\\text{Non}"} /></RB></Step>
</>)}
function TEST5E5() { return (<>
  <Step index={0} title="Logarithmes et Inéquations — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;D_f=]0,+\\infty[\\quad 2)\\;X=1\\text{ et }X=2\\quad 3)\\;x=e\\text{ et }x=e^2"} />
  </IB><RB><BM t={"4)\\;\\ln(x)>1\\iff x\\in]e,+\\infty["} /></RB></Step>
</>)}

const DB = {
  'T1-E1': { title:'Matrices et Systèmes',    badge:'Sujet 1 · Ex.1 · Algèbre',       C:<T1E1/> },
  'T1-E2': { title:'Suites Numériques',        badge:'Sujet 1 · Ex.2 · Analyse',       C:<T1E2/> },
  'T1-E3': { title:'Statistiques',             badge:'Sujet 1 · Ex.3 · Stats',         C:<T1E3/> },
  'T1-E4': { title:'Étude de Fonction — Ln',   badge:'Sujet 1 · Ex.4 · Analyse',       C:<T1E4/> },
  'T2-E1': { title:'Matrices et Applications', badge:'Sujet 2 · Ex.1 · Algèbre',       C:<T2E1/> },
  'T2-E2': { title:'Suites Numériques',        badge:'Sujet 2 · Ex.2 · Analyse',       C:<T2E2/> },
  'T2-E3': { title:'Statistiques',             badge:'Sujet 2 · Ex.3 · Stats',         C:<T2E3/> },
  'T2-E4': { title:'Étude de Fonction — Exp',  badge:'Sujet 2 · Ex.4 · Analyse',       C:<T2E4/> },
  'T3-E1': { title:'Matrices et Suites',       badge:'Sujet 3 · Ex.1 · Algèbre',       C:<T3E1/> },
  'T3-E2': { title:'Théorie des Graphes',      badge:'Sujet 3 · Ex.2 · Graphes',       C:<T3E2/> },
  'T3-E3': { title:'Probabilités',             badge:'Sujet 3 · Ex.3 · Proba',         C:<T3E3/> },
  'T3-E4': { title:'Étude de Fonction — Ln',   badge:'Sujet 3 · Ex.4 · Analyse',       C:<T3E4/> },
  'T4-E1': { title:'Matrices',                 badge:'Sujet 4 · Ex.1 · Algèbre',       C:<T4E1/> },
  'T4-E2': { title:'Suites Numériques',        badge:'Sujet 4 · Ex.2 · Analyse',       C:<T4E2/> },
  'T4-E3': { title:'Statistiques',             badge:'Sujet 4 · Ex.3 · Stats',         C:<T4E3/> },
  'T4-E4': { title:'Étude de Fonction — Exp',  badge:'Sujet 4 · Ex.4 · Analyse',       C:<T4E4/> },
  'T5-E1': { title:'Matrices et Fonctions',    badge:'Sujet 5 · Ex.1 · Algèbre',       C:<T5E1/> },
  'T5-E2': { title:'Statistiques',             badge:'Sujet 5 · Ex.2 · Stats',         C:<T5E2/> },
  'T5-E3': { title:'Théorie des Graphes',      badge:'Sujet 5 · Ex.3 · Graphes',       C:<T5E3/> },
  'T5-E4': { title:'Matrices et Fonction Ln',  badge:'Sujet 5 · Ex.4 · Analyse',       C:<T5E4/> },
  
  // Sujet 6 à 10
  'T6-E1': { title:'Matrices et Systèmes', badge:'Sujet 6 · Ex.1', C:<T6E1/> },
  'T6-E2': { title:'Suites numériques', badge:'Sujet 6 · Ex.2', C:<T6E2/> },
  'T6-E3': { title:'Probabilités — Formation', badge:'Sujet 6 · Ex.3', C:<T6E3/> },
  'T6-E4': { title:'Étude de fonction — Exponentielle', badge:'Sujet 6 · Ex.4', C:<T6E4/> },

  'T7-E1': { title:'Matrices et Systèmes', badge:'Sujet 7 · Ex.1', C:<T7E1/> },
  'T7-E2': { title:'Graphes orientés — Graphe d\'ordre 7', badge:'Sujet 7 · Ex.2', C:<T7E2/> },
  'T7-E3': { title:'Statistiques — Prix d\'équilibre', badge:'Sujet 7 · Ex.3', C:<T7E3/> },
  'T7-E4': { title:'Étude de fonction — Logarithme', badge:'Sujet 7 · Ex.4', C:<T7E4/> },

  'T8-E1': { title:'Matrices et Systèmes', badge:'Sujet 8 · Ex.1', C:<T8E1/> },
  'T8-E2': { title:'Probabilités', badge:'Sujet 8 · Ex.2', C:<T8E2/> },
  'T8-E3': { title:'Suites numériques', badge:'Sujet 8 · Ex.3', C:<T8E3/> },
  'T8-E4': { title:'Étude de fonction — Exponentielle', badge:'Sujet 8 · Ex.4', C:<T8E4/> },

  'T9-E1': { title:'Probabilités', badge:'Sujet 9 · Ex.1', C:<T9E1/> },
  'T9-E2': { title:'Matrices et Systèmes', badge:'Sujet 9 · Ex.2', C:<T9E2/> },
  'T9-E3': { title:'Analyse — Lecture Graphique', badge:'Sujet 9 · Ex.3', C:<T9E3/> },
  'T9-E4': { title:'Théorie des Graphes', badge:'Sujet 9 · Ex.4', C:<T9E4/> },

  'T10-E1': { title:'Statistiques — Ajustement', badge:'Sujet 10 · Ex.1', C:<T10E1/> },
  'T10-E2': { title:'Matrices et Systèmes', badge:'Sujet 10 · Ex.2', C:<T10E2/> },
  'T10-E3': { title:'Analyse — Fonctions', badge:'Sujet 10 · Ex.3', C:<T10E3/> },
  'T10-E4': { title:'Théorie des Graphes — Non orienté', badge:'Sujet 10 · Ex.4', C:<T10E4/> },

  // Tests 1 à 5
  'TEST1-E1': { title:'Fonctions Exponentielles', badge:'Test 1 · Ex.1', C:<TEST1E1/> },
  'TEST1-E2': { title:'Théorie des Graphes et Matrices', badge:'Test 1 · Ex.2', C:<TEST1E2/> },
  'TEST1-E3': { title:'Probabilités et Variables Aléatoires', badge:'Test 1 · Ex.3', C:<TEST1E3/> },
  'TEST1-E4': { title:'Statistiques', badge:'Test 1 · Ex.4', C:<TEST1E4/> },
  'TEST1-E5': { title:'Suites Numériques', badge:'Test 1 · Ex.5', C:<TEST1E5/> },

  'TEST2-E1': { title:'Fonctions Logarithmes', badge:'Test 2 · Ex.1', C:<TEST2E1/> },
  'TEST2-E2': { title:'Analyse et Lecture graphique', badge:'Test 2 · Ex.2', C:<TEST2E2/> },
  'TEST2-E3': { title:'Matrices et Systèmes', badge:'Test 2 · Ex.3', C:<TEST2E3/> },
  'TEST2-E4': { title:'Suites numériques', badge:'Test 2 · Ex.4', C:<TEST2E4/> },
  'TEST2-E5': { title:'Graphes Probabilistes', badge:'Test 2 · Ex.5', C:<TEST2E5/> },

  'TEST3-E1': { title:'Évaluation QCM - Ex.1', badge:'Test 3 · Ex.1', C:<TEST3E1/> },
  'TEST3-E2': { title:'Évaluation QCM - Ex.2', badge:'Test 3 · Ex.2', C:<TEST3E2/> },
  'TEST3-E3': { title:'Évaluation QCM - Ex.3', badge:'Test 3 · Ex.3', C:<TEST3E3/> },
  'TEST3-E4': { title:'Évaluation QCM - Ex.4', badge:'Test 3 · Ex.4', C:<TEST3E4/> },
  'TEST3-E5': { title:'Évaluation QCM - Ex.5', badge:'Test 3 · Ex.5', C:<TEST3E5/> },

  'TEST4-E1': { title:'Évaluation QCM - Ex.1', badge:'Test 4 · Ex.1', C:<TEST4E1/> },
  'TEST4-E2': { title:'Évaluation QCM - Ex.2', badge:'Test 4 · Ex.2', C:<TEST4E2/> },
  'TEST4-E3': { title:'Évaluation QCM - Ex.3', badge:'Test 4 · Ex.3', C:<TEST4E3/> },
  'TEST4-E4': { title:'Évaluation QCM - Ex.4', badge:'Test 4 · Ex.4', C:<TEST4E4/> },
  'TEST4-E5': { title:'Évaluation QCM - Ex.5', badge:'Test 4 · Ex.5', C:<TEST4E5/> },

  'TEST5-E1': { title:'Évaluation QCM - Ex.1', badge:'Test 5 · Ex.1', C:<TEST5E1/> },
  'TEST5-E2': { title:'Évaluation QCM - Ex.2', badge:'Test 5 · Ex.2', C:<TEST5E2/> },
  'TEST5-E3': { title:'Évaluation QCM - Ex.3', badge:'Test 5 · Ex.3', C:<TEST5E3/> },
  'TEST5-E4': { title:'Évaluation QCM - Ex.4', badge:'Test 5 · Ex.4', C:<TEST5E4/> },
  'TEST5-E5': { title:'Évaluation QCM - Ex.5', badge:'Test 5 · Ex.5', C:<TEST5E5/> }
}

export default function App() {
  const [exoId, setExoId] = useState('')
  const [input, setInput] = useState('')
  const [correction, setCorrection] = useState(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('exo')
    if (id) { const u = id.toUpperCase(); setExoId(u); setInput(u); load(u) }
  }, [])

  const load = (id) => { setSearched(true); setCorrection(DB[id] || null) }
  const nav = (k) => { setInput(k); setExoId(k); load(k); const u = new URL(window.location); u.searchParams.set('exo', k); window.history.pushState({}, '', u) }
  const submit = (e) => { e.preventDefault(); const id = input.trim().toUpperCase(); nav(id) }
  // Pour les sujets et les Tests, on veut télécharger le PDF du sujet complet (ex: T1 ou TEST1)
  const simplePdfName = (id) => id.split('-')[0]
  // Belfallagui: on utilise toujours le fichier complet regroupé par sujet
  const belPdfName = (id) => `belfallagui_corrige_${id.split('-')[0]}_complet`
  // Corrigé Révision Premium BAC: corrige_revision_1.pdf à corrige_revision_5.pdf
  const revNum = (id) => { const m = id.match(/^T(\d+)/); return m ? parseInt(m[1]) : null }
  const hasRevPdf = (id) => { const n = revNum(id); return n && n >= 1 && n <= 5 }
  const revPdfName = (id) => `corrige_revision_${revNum(id)}`

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span className="logo-main">Soltani</span>
          <br/>
          <span className="logo-accent">Books</span>
        </div>
        <div className="header-sub">Corrigés Détaillés</div>
      </header>
      <main className="main-content">
        <section className="search-section">
          <h1 className="search-title">Trouvez votre corrigé</h1>
          <p className="search-subtitle">Scannez le QR code ou entrez le code de l'exercice</p>
          <form className="search-box" onSubmit={submit}>
            <input className="search-input" type="text" placeholder="Code exercice (ex: T1-E1)" value={input} onChange={e => setInput(e.target.value)} />
            <button className="search-button" type="submit">Rechercher</button>
          </form>
        </section>

        {searched && correction && (
          <article className="correction-card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="exo-badge">{correction.badge}</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <a 
                    href={`${import.meta.env.BASE_URL}assets/${belPdfName(exoId)}.pdf`} 
                    download 
                    className="download-pdf-btn"
                    style={{ background: 'linear-gradient(135deg, #F51E65, #c9104b)', borderColor: '#F51E65' }}
                    title="Télécharger la version Belfallagui (corrigé détaillé bilingue complet)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Version Belfallagui</span>
                  </a>

                  {hasRevPdf(exoId) && (
                    <a
                      href={`${import.meta.env.BASE_URL}assets/${revPdfName(exoId)}.pdf`}
                      download
                      className="download-pdf-btn"
                      style={{ background: 'linear-gradient(135deg, #39d6c3, #1faA9a)', borderColor: '#39d6c3' }}
                      title="Télécharger le Corrigé Révision Premium BAC (version complète)"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                      </svg>
                      <span>Corrigé Premium BAC</span>
                    </a>
                  )}
                </div>
              </div>
              <h2 className="card-title">{correction.title}</h2>
            </div>
            <div className="card-body">{correction.C}</div>
          </article>
        )}
        {searched && !correction && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>Corrigé introuvable</h2>
            <p>Le code « {exoId} » n'existe pas encore.</p>
          </div>
        )}
      </main>
      <footer className="footer"><p>© 2026 Soltani Books – Tous droits réservés.</p></footer>
    </div>
  )
}
