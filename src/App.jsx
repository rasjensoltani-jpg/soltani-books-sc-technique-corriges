import { useState, useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './index.css'
import T from './formulas.json'
import { ScatterPlot, FunctionCurve, VariationTable, ProbabilityTree } from './charts.jsx'

const tex = (s, d = false) => ({ __html: katex.renderToString(s, { throwOnError: false, displayMode: d }) })
const IM = ({ t }) => <span dangerouslySetInnerHTML={tex(t)} />
const BM = ({ t }) => <div className="block-math" dangerouslySetInnerHTML={tex(t, true)} />


function ComplexAnimation() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const sq3 = Math.sqrt(3);
  const W = 500, SVH = 400;
  const OX = 180, OY = 210, SCALE = 62;
  const px = x => OX + x * SCALE;
  const py = y => OY - y * SCALE;

  const STEPS = [
    { id:'setup', label:'Plan complexe', color:'#6366f1', title:null, lines:[] },
    { id:'A1', label:'A: cercle r=2', color:'#e0296e',
      title:'① Module de z_A', lines:['|z_A| = √(3+1) = 2','→ A ∈ C(O, 2)'] },
    { id:'A2', label:'A: droite y=1', color:'#e0296e',
      title:'② Partie entière de Im(z_A)', lines:['Im(z_A) = 1 ∈ ℤ','→ A sur la droite y = 1','(2 intersections possibles)'] },
    { id:'A3', label:'A placé ✓', color:'#e0296e',
      title:'③ Signe de Re(z_A)', lines:["Re(z_A) = √3 > 0","→ A est à droite de Im","→ A = (√3, 1)  ✓"] },
    { id:'B1', label:'B: cercle r=2', color:'#f59e0b',
      title:'① Module de z_B', lines:['|z_B| = √(1+3) = 2','→ B ∈ C(O, 2)'] },
    { id:'B2', label:'B: droite x=−1', color:'#f59e0b',
      title:'② Partie entière de Re(z_B)', lines:['Re(z_B) = −1 ∈ ℤ','→ B sur la droite x = −1','(2 intersections possibles)'] },
    { id:'B3', label:'B placé ✓', color:'#f59e0b',
      title:'③ Signe de Im(z_B)', lines:['Im(z_B) = √3 > 0','→ B est au-dessus de Re','→ B = (−1, √3)  ✓'] },
    { id:'C1', label:'C placé ✓', color:'#3b82f6',
      title:'z_C = 2 ∈ ℤ', lines:['z_C = 2 (entier)','Re et Im sont entiers','→ C = (2, 0) directement  ✓'] },
    { id:'H1', label:'H: ⊥(BC) par A', color:'#f97316',
      title:'① Perpendiculaire à (BC) par A', lines:['(AH) ⊥ (BC)','Droite passant par A','de direction ⊥ à (BC)'] },
    { id:'H2', label:'H: droite arg=π/4', color:'#8b5cf6',
      title:'② Droite angle π/4 par O', lines:['arg(z_H) = π/4','→ la droite y = x (depuis O)','z_H = (√3+1)(1+i)'] },
    { id:'H3', label:'H = intersection ✓', color:'#10b981',
      title:'H = intersection des 2 droites', lines:['H = (√3+1, √3+1)','|z_H| = (√3+1)√2','arg(z_H) = π/4  ✓'] },
  ];

  const restart = () => { setStep(-1); setPlaying(false); };
  const start   = () => { setStep(0); setPlaying(true); };

  useEffect(() => {
    if (!playing || step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 2200);
    return () => clearTimeout(t);
  }, [playing, step]);

  const fi = { opacity:0, animation:'fadeIn 0.7s ease-out forwards' };
  const ticks = [-2, -1, 1, 2, 3];
  const BCdx = 3, BCdy = -sq3, BClen = Math.sqrt(9+3);
  const extBC  = t => ({ x:-1+t*BCdx/BClen, y:sq3+t*BCdy/BClen });
  const perpDx = BCdy, perpDy = -BCdx, perpLen = BClen;
  const extPerp= t => ({ x:sq3+t*perpDx/perpLen, y:1+t*perpDy/perpLen });

  const s = step;
  const ids = s >= 0 ? STEPS.slice(0, s+1).map(x=>x.id) : [];
  const has = id => ids.includes(id);

  const Dot = ({x,y,col,r=5}) => <circle cx={px(x)} cy={py(y)} r={r} fill={col} stroke="white" strokeWidth="1.5"/>;
  const Lbl = ({x,y,col,name,sub,dx=10,dy=-6}) => (
    <g>
      <text x={px(x)+dx} y={py(y)+dy} fontSize="13" fontWeight="800" fill={col}>{name}</text>
      {sub && <text x={px(x)+dx} y={py(y)+dy+13} fontSize="9" fill={col} fontStyle="italic">{sub}</text>}
    </g>
  );

  const info = s >= 0 ? STEPS[s] : null;

  return (
    <div style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius:'16px', padding:'14px', fontFamily:'Inter,sans-serif' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'10px' }}>
        {STEPS.map((st,i) => (
          <span key={i} onClick={() => { setPlaying(false); setStep(i); }} style={{
            padding:'2px 9px', borderRadius:'20px', fontSize:'10px', fontWeight:600, cursor:'pointer',
            background: s>=i ? st.color : '#334155', color: s>=i ? 'white' : '#64748b',
            transition:'all 0.3s', outline: s===i ? '2px solid '+st.color : 'none', outlineOffset:'1px'
          }}>{i+1}. {st.label}</span>
        ))}
      </div>

      <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <div style={{ flex:'1 1 0', background:'#f8fafc', borderRadius:'10px', overflow:'hidden' }}>
          <svg viewBox={"0 0 "+W+" "+SVH} style={{ width:'100%', display:'block' }}>
            {ticks.map(t => (
              <g key={t}>
                <line x1={px(t)} y1={8} x2={px(t)} y2={SVH-8} stroke="#e2e8f0" strokeWidth="0.8"/>
                <line x1={8} y1={py(t)} x2={W-8} y2={py(t)} stroke="#e2e8f0" strokeWidth="0.8"/>
                <text x={px(t)} y={OY+14} textAnchor="middle" fontSize="10" fill="#94a3b8">{t}</text>
                <text x={OX-8} y={py(t)+4} textAnchor="end" fontSize="10" fill="#94a3b8">{t}</text>
              </g>
            ))}
            <defs>
              <marker id="cax2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill="#475569"/>
              </marker>
            </defs>
            <line x1={12} y1={OY} x2={W-8} y2={OY} stroke="#475569" strokeWidth="1.8" markerEnd="url(#cax2)"/>
            <line x1={OX} y1={SVH-12} x2={OX} y2={8} stroke="#475569" strokeWidth="1.8" markerEnd="url(#cax2)"/>
            <text x={W-10} y={OY+14} textAnchor="end" fontSize="11" fill="#475569" fontWeight="700">Re</text>
            <text x={OX+5} y={16} fontSize="11" fill="#475569" fontWeight="700">Im</text>
            <text x={OX+4} y={OY+14} fontSize="10" fill="#475569">O</text>

            {s>=0 && (
              <g style={fi}>
                <circle cx={OX} cy={OY} r={2*SCALE} fill="rgba(99,102,241,0.06)" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3"/>
                <text x={OX+2*SCALE+4} y={OY-5} fontSize="11" fill="#6366f1" fontStyle="italic">C(O,2)</text>
              </g>
            )}

            {/* ── A ── */}
            {has('A2') && (
              <g style={fi}>
                <line x1={12} y1={py(1)} x2={W-80} y2={py(1)} stroke="#e0296e" strokeWidth="1.8" strokeDasharray="6 3"/>
                <text x={W-78} y={py(1)+4} fontSize="10" fill="#e0296e" fontWeight="700">y=1</text>
                <circle cx={px(sq3)}  cy={py(1)} r={7} fill="none" stroke="#e0296e" strokeWidth="2" strokeDasharray="3 2"/>
                <circle cx={px(-sq3)} cy={py(1)} r={7} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2"/>
                <text x={px(-sq3)} y={py(1)-12} textAnchor="middle" fontSize="9" fill="#94a3b8">−√3+i</text>
              </g>
            )}
            {has('A3') && (
              <g style={fi}>
                <circle cx={px(-sq3)} cy={py(1)} r={6} fill="#cbd5e1" opacity="0.5"/>
                <line x1={OX} y1={py(1)} x2={px(sq3)} y2={py(1)} stroke="#e0296e" strokeWidth="1" strokeDasharray="2 2"/>
                <line x1={px(sq3)} y1={OY} x2={px(sq3)} y2={py(1)} stroke="#e0296e" strokeWidth="1" strokeDasharray="2 2"/>
                <Dot x={sq3} y={1} col="#e0296e" r={6}/>
                <Lbl x={sq3} y={1} col="#e0296e" name="A" sub="(√3, 1)" dy={-8}/>
                <text x={px(sq3)} y={py(1)-22} textAnchor="middle" fontSize="9" fill="#e0296e" fontWeight="700">Re &gt; 0 → droite ✓</text>
              </g>
            )}
            {s>3 && (<g><Dot x={sq3} y={1} col="#e0296e"/><Lbl x={sq3} y={1} col="#e0296e" name="A" dy={-8}/></g>)}

            {/* ── B ── */}
            {has('B2') && (
              <g style={fi}>
                <line x1={px(-1)} y1={12} x2={px(-1)} y2={SVH-12} stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="6 3"/>
                <text x={px(-1)+4} y={16} fontSize="10" fill="#f59e0b" fontWeight="700">x=−1</text>
                <circle cx={px(-1)} cy={py(sq3)}  r={7} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2"/>
                <circle cx={px(-1)} cy={py(-sq3)} r={7} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2"/>
                <text x={px(-1)+10} y={py(-sq3)+4} fontSize="9" fill="#94a3b8">−1−i√3</text>
              </g>
            )}
            {has('B3') && (
              <g style={fi}>
                <circle cx={px(-1)} cy={py(-sq3)} r={6} fill="#cbd5e1" opacity="0.5"/>
                <line x1={OX} y1={py(sq3)} x2={px(-1)} y2={py(sq3)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2"/>
                <line x1={px(-1)} y1={OY} x2={px(-1)} y2={py(sq3)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2"/>
                <Dot x={-1} y={sq3} col="#f59e0b" r={6}/>
                <Lbl x={-1} y={sq3} col="#f59e0b" name="B" sub="(−1, √3)" dx={-58} dy={-8}/>
                <text x={px(-1)+8} y={py(sq3)-22} fontSize="9" fill="#f59e0b" fontWeight="700">Im &gt; 0 → dessus ✓</text>
              </g>
            )}
            {s>6 && (<g><Dot x={-1} y={sq3} col="#f59e0b"/><Lbl x={-1} y={sq3} col="#f59e0b" name="B" dx={-20} dy={-8}/></g>)}

            {/* ── C ── */}
            {has('C1') && (
              <g style={fi}>
                <Dot x={2} y={0} col="#3b82f6" r={6}/>
                <Lbl x={2} y={0} col="#3b82f6" name="C" sub="(2, 0)" dx={8} dy={-8}/>
              </g>
            )}
            {s>7 && (<g><Dot x={2} y={0} col="#3b82f6"/><Lbl x={2} y={0} col="#3b82f6" name="C" dx={8} dy={-8}/></g>)}

            {/* ── H ── */}
            {has('H1') && (
              <g style={fi}>
                <line x1={px(extBC(-1.2).x)} y1={py(extBC(-1.2).y)} x2={px(extBC(2.6).x)} y2={py(extBC(2.6).y)} stroke="#f97316" strokeWidth="2"/>
                <text x={px(extBC(2.4).x)+4} y={py(extBC(2.4).y)-5} fontSize="10" fill="#f97316" fontWeight="700">(BC)</text>
                <line x1={px(extPerp(-2).x)} y1={py(extPerp(-2).y)} x2={px(extPerp(2.2).x)} y2={py(extPerp(2.2).y)} stroke="#e0296e" strokeWidth="2" strokeDasharray="7 3"/>
                <text x={px(extPerp(-1.8).x)+4} y={py(extPerp(-1.8).y)-5} fontSize="10" fill="#e0296e" fontWeight="700">⊥(BC) par A</text>
                {(()=>{ const ang=Math.atan2(-BCdy,-BCdx),s2=Math.sin(ang+Math.PI/2),c2=Math.cos(ang+Math.PI/2),co=Math.cos(ang),si=Math.sin(ang),d=11;
                  return <polyline points={px(sq3)+d*co+','+(py(1)-d*si)+' '+(px(sq3)+d*co+d*c2)+','+(py(1)-d*si-d*s2)+' '+(px(sq3)+d*c2)+','+(py(1)-d*s2)} fill="none" stroke="#e0296e" strokeWidth="1.8"/>; })()}
              </g>
            )}
            {has('H2') && (
              <g style={fi}>
                <line x1={px(-0.3)} y1={py(-0.3)} x2={px(3.8)} y2={py(3.8)} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="7 3"/>
                <path d={"M "+(OX+34)+","+OY+" A 34,34 0 0,0 "+(OX+34*Math.cos(Math.PI/4))+","+(OY-34*Math.sin(Math.PI/4))} fill="none" stroke="#8b5cf6" strokeWidth="1.5"/>
                <text x={OX+36} y={OY-16} fontSize="10" fill="#8b5cf6" fontWeight="700">π/4</text>
                <text x={px(3.5)+4} y={py(3.5)-6} fontSize="10" fill="#8b5cf6" fontWeight="700">arg=π/4</text>
              </g>
            )}
            {has('H3') && (
              <g style={fi}>
                <circle cx={px(sq3+1)} cy={py(sq3+1)} r={16} fill="rgba(16,185,129,0.18)" stroke="#10b981" strokeWidth="2"/>
                <line x1={OX} y1={py(sq3+1)} x2={px(sq3+1)} y2={py(sq3+1)} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2"/>
                <line x1={px(sq3+1)} y1={OY} x2={px(sq3+1)} y2={py(sq3+1)} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2"/>
                <Dot x={sq3+1} y={sq3+1} col="#10b981" r={7}/>
                <Lbl x={sq3+1} y={sq3+1} col="#10b981" name="H" sub={"(√3+1, √3+1)"} dx={10} dy={-8}/>
              </g>
            )}
          </svg>
        </div>

        <div style={{ width:'158px', flexShrink:0, background:'#1e293b', borderRadius:'10px', padding:'12px', minHeight:'260px' }}>
          {info && info.title ? (
            <>
              <div style={{ background:info.color, borderRadius:'6px', padding:'5px 8px', fontSize:'11px', fontWeight:700, color:'white', marginBottom:'10px' }}>
                {info.title}
              </div>
              {info.lines.map((l,i) => (
                <div key={i} style={{ fontSize:'11px', color: i===info.lines.length-1 ? '#86efac' : '#cbd5e1',
                  fontWeight: i===info.lines.length-1 ? 700 : 400, marginBottom:'5px' }}>{l}</div>
              ))}
            </>
          ) : (
            <div style={{ color:'#475569', fontSize:'11px', marginTop:'20px', textAlign:'center' }}>
              {s < 0 ? "Lance l'animation →" : 'Plan complexe prêt'}
            </div>
          )}
          <div style={{ marginTop:'14px', borderTop:'1px solid #334155', paddingTop:'10px' }}>
            <div style={{ fontSize:'10px', color:'#475569', fontWeight:600, marginBottom:'6px' }}>TECHNIQUE (3 étapes)</div>
            {['① Module → cercle','② Partie entière → droite','③ Signe irrationnel → point'].map((t,i) => (
              <div key={i} style={{ fontSize:'10px', color:'#64748b', marginBottom:'4px' }}>
                <span style={{ color:['#6366f1','#e0296e','#f59e0b'][i] }}>●</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'7px', marginTop:'10px', alignItems:'center', flexWrap:'wrap' }}>
        {s < 0 ? (
          <button onClick={start} style={{ padding:'8px 20px', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>▶ Lancer</button>
        ) : (
          <>
            <button onClick={() => setStep(s => Math.max(0,s-1))} style={{ padding:'6px 12px', background:'#334155', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontSize:'12px', opacity:s>0?1:0.4 }}>◀</button>
            <button onClick={() => setStep(s => Math.min(STEPS.length-1,s+1))} style={{ padding:'6px 12px', background:'#6366f1', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontSize:'12px', opacity:s<STEPS.length-1?1:0.4 }}>▶</button>
            <button onClick={restart} style={{ padding:'6px 12px', background:'#475569', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontSize:'12px' }}>↺</button>
            <button onClick={() => { setStep(0); setPlaying(true); }} style={{ padding:'6px 12px', background:'#10b981', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontSize:'12px' }}>▶ Auto</button>
            <span style={{ color:'#94a3b8', fontSize:'11px' }}>{s+1}/{STEPS.length} — {STEPS[s]?.label}</span>
          </>
        )}
      </div>
    </div>
  );
}



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
  <Step index={0} title={<>Solution <IM t="z_1" /></>}>
    <p>On donne l\'équation <IM t={T.T1E1_E} /></p>
    <IB label="Vérification">Pour <IM t={T.T1E1_z1} /> :</IB>
    <BM t={T.T1E1_verif1} /><BM t={T.T1E1_verif2} /><BM t={T.T1E1_verif3} />
    <RB>Donc <IM t="z_1" /> est bien une solution de (E) ✓</RB>
  </Step>
  <Step index={1} title={<>L\'autre solution <IM t="z_2" /></>}>
    <IB label="Astuce">La somme des racines est <IM t="-\frac{b}{a}" /></IB>
    <BM t={T.T1E1_sum} />
    <p>On en déduit :</p>
    <BM t={T.T1E1_z2} />
    <RB>La deuxième solution est <IM t={T.T1E1_z2} /> ✓</RB>
  </Step>
  <Step index={2} title={<>Points sur le cercle <IM t="\zeta" /></>}>
    <BM t={T.T1E1_zA} /><BM t={T.T1E1_zB} />
    <RB><IM t={T.T1E1_cer} /> ✓</RB>
  </Step>
  <Step index={3} title={<>Calcul de <IM t="\frac{z_B + z_C}{z_C - z_B}" /></>}>
    <BM t={T.T1E1_frac1} /><BM t={T.T1E1_frac2} />
    <RB>Le résultat est bien <IM t="i\frac{\sqrt{3}}{3}" /> ✓</RB>
  </Step>
  <Step index={4} title={<>Orthogonalité des droites <IM t="(AH)" /> et <IM t="(BC)" /></>}>
    <BM t={T.T1E1_perp1} /><BM t={T.T1E1_perp2} />
    <RB>Les droites <IM t="(AH)" /> et <IM t="(BC)" /> sont perpendiculaires ✓</RB>
  </Step>
  <Step index={5} title={<>Affixe de <IM t="H" /></>}>
    <BM t={T.T1E1_zH1} /><BM t={T.T1E1_zH2} />
    <RB>On obtient bien <IM t="z_H = \sqrt{2}(1 + \sqrt{3})e^{i\frac{\pi}{4}}" /> ✓</RB>
  </Step>
  <Step index={6} title={<>Construction des points <IM t="A, B" /> et <IM t="H" /></>}>
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <ComplexAnimation />
    </div>
    <RB>Les points sont placés dans le plan complexe ✓</RB>
  </Step>
</>)}

// ── T1-E2 ─────────────────────────────────────────────────────────────────────
function T1E2() { return (<>
  <Step index={0} title={<>Équation cartésienne du plan <IM t="P" /></>}>
    <BM t={T.T1E2_AB} /><BM t={T.T1E2_ABAC} /><BM t={T.T1E2_plan1} />
    <BM t={T.T1E2_plan2} /><BM t={T.T1E2_plan3} />
    <RB>L\'équation de <IM t="P" /> est bien <IM t="x - y + z + 1 = 0" /> ✓</RB>
  </Step>
  <Step index={1} title={<>Projeté orthogonal <IM t="H" /> de <IM t="I" /></>}>
    <BM t={T.T1E2_H1} /><BM t={T.T1E2_H2} />
    <RB><IM t="H" /> est bien le projeté orthogonal de <IM t="I" /> sur <IM t="P" /> ✓</RB>
  </Step>
  <Step index={2} title={<>La sphère <IM t="S" /> et ses points</>}>
    <BM t={T.T1E2_S1} /><BM t={T.T1E2_S2} />
    <BM t={T.T1E2_S3} /><BM t={T.T1E2_S4} />
    <RB><IM t="A" /> et <IM t="B" /> appartiennent à <IM t="S" /> ✓</RB>
  </Step>
  <Step index={3} title={<>Intersection <IM t="P \cap S" /> et la droite <IM t="(AB)" /></>}>
    <BM t={T.T1E2_dIP} /><BM t={T.T1E2_dIP2} />
    <BM t={T.T1E2_r} />
    <BM t={T.T1E2_ABinP} />
    <RB>Le cercle <IM t="\mathscr{C}" /> est coupé par <IM t="(AB)" /> en <IM t="A" /> et <IM t="B" /> ✓</RB>
  </Step>
  <Step index={4} title={<>Le plan <IM t="Q" /></>}>
    <BM t={T.T1E2_Q1} /><BM t={T.T1E2_Q2} />
    <RB><IM t="P" /> et <IM t="Q" /> sont sécants suivant <IM t="(AB)" /> ✓</RB>
  </Step>
  <Step index={5} title={<>Produit scalaire <IM t="\overrightarrow{IE} \cdot \overrightarrow{IM} = 0" /></>}>
    <BM t={T.T1E2_E} /><BM t={T.T1E2_orth} />
    <RB>Condition vérifiée si et seulement si <IM t="M \in Q" /> ✓</RB>
  </Step>
  <Step index={6} title={<>Triangle <IM t="IME" /> rectangle isocèle</>}>
    <BM t={T.T1E2_M1} /><BM t={T.T1E2_M2} /><BM t={T.T1E2_M3} />
    <RB>L\'ensemble des points est <IM t="\{A, B\}" /> ✓</RB>
  </Step>
</>)}

// ── T1-E3 ─────────────────────────────────────────────────────────────────────
function T1E3() { return (<>
  <Step index={0} title={<>Montrer <IM t="0 < U_n \leqslant 2" /></>}>
    <Rec
      prop={<IM t="P(n) : 0 < U_n \\leqslant 2" />}
      verif={<BM t={T.T1E3_rec1} />}
      suppo={<p>On suppose <IM t="0 < U_n \leqslant 2" /> vrai pour un certain <IM t="n" />.</p>}
      demo={<BM t={T.T1E3_rec2} />}
    />
    <RB>Propriété démontrée par récurrence ✓</RB>
  </Step>
  <Step index={1} title={<>Monotonie de <IM t="(U_n)" /></>}>
    <BM t={T.T1E3_diff1} /><BM t={T.T1E3_diff2} />
    <RB>La suite <IM t="(U_n)" /> est croissante ✓</RB>
  </Step>
  <Step index={2} title={<>Convergence de <IM t="(U_n)" /></>}>
    <BM t={T.T1E3_lim1} /><BM t={T.T1E3_lim2} />
    <RB>La limite de <IM t="(U_n)" /> est <IM t="2" /> ✓</RB>
  </Step>
  <Step index={3} title={<>Suite <IM t="(V_n)" /></>}>
    <BM t={T.T1E3_Vrec} /><BM t={T.T1E3_V0} />
    <RB>Suite géométrique de raison <IM t="\frac{1}{2}" /> et de premier terme <IM t="\ln 2" /> ✓</RB>
  </Step>
  <Step index={4} title={<>Somme <IM t="S_n" /></>}>
    <BM t={T.T1E3_Sn} /><BM t={T.T1E3_Snlim} />
    <RB><IM t="S_n = 2\ln 2 \left(1 - \left(\frac{1}{2}\right)^n\right)" /> et sa limite est <IM t="\ln 4" /> ✓</RB>
  </Step>
  <Step index={5} title={<>Limite de <IM t="e^{\ln 2 - \frac{S_n}{n}}" /></>}>
    <BM t={T.T1E3_L1} /><BM t={T.T1E3_L2} /><BM t={T.T1E3_L3} />
    <RB>La limite finale est bien <IM t="2" /> ✓</RB>
  </Step>
</>)}

// ── T1-E4 ─────────────────────────────────────────────────────────────────────
function T1E4() { return (<>
  <Step index={0} title={<>Limites en <IM t="-\infty" /></>}>
    <BM t={T.T1E4_limM1} /><BM t={T.T1E4_limM2} />
    <RB>Asymptote horizontale en <IM t="-\infty" /> ✓</RB>
  </Step>
  <Step index={1} title={<>Dérivée et variations de <IM t="f" /></>}>
    <BM t={T.T1E4_fp1} /><BM t={T.T1E4_fp2} />
    <VariationTable xVals={[{tex: "-\\infty"}, {tex: "-1"}, {tex: "0"}, {tex: "+\\infty"}]}
                    signs={["+", "-", "+"]}
                    arrows={["up", "down", "up"]}
                    fVals={[{tex: "0", pos: "bot"}, {tex: "\\frac{3}{e}", pos: "top"}, {tex: "1", pos: "bot"}, {tex: "+\\infty", pos: "top"}]} />
    <RB>Tableau de variations complet ✓</RB>
  </Step>
  <Step index={2} title={<>Bijection sur <IM t="[0, 1]" /></>}>
    <BM t={T.T1E4_bij1} /><BM t={T.T1E4_bij2} />
    <RB><IM t="f" /> réalise une bijection sur l\'intervalle <IM t="J = [1, e]" /> ✓</RB>
  </Step>
  <Step index={3} title={<>Tangente en <IM t="0" /></>}>
    <BM t={T.T1E4_T0} />
    <RB>Tangente horizontale d\'équation <IM t="y = 1" /> ✓</RB>
  </Step>
  <Step index={4} title={<>Suite <IM t="(I_n)" /></>}>
    <BM t={T.T1E4_In1} /><BM t={T.T1E4_In2} />
    <RB>La suite <IM t="(I_n)" /> est positive et décroissante ✓</RB>
  </Step>
  <Step index={5} title={<>Limite de <IM t="(I_n)" /></>}>
    <BM t={T.T1E4_Inlim1} /><BM t={T.T1E4_Inlim2} />
    <RB>La limite est <IM t="0" /> d\'après le théorème des gendarmes ✓</RB>
  </Step>
  <Step index={6} title={<>Valeur moyenne</>}>
    <IB label="Intégration par parties">Pour <IM t="I_0" /></IB>
    <BM t={T.T1E4_IPP1} /><BM t={T.T1E4_IPP2} />
    <BM t={T.T1E4_Vmoy} />
    <RB>La valeur moyenne est <IM t="2e - 4" /> ✓</RB>
  </Step>
  <Step index={7} title={<>Tracé de la courbe <IM t="(\mathcal{C}_f)" /></>}>
    <FunctionCurve
      fn={(x) => (x * x - x + 1) * Math.exp(x)}
      xmin={-4} xmax={1.5}
      ymin={-0.5} ymax={5}
      xticks={[-4, -3, -2, -1, 0, 1]}
      yticks={[0, 1, 2, 3, 4, 5]}
      title={<>Courbe représentative de <IM t="f(x) = (x^2-x+1)e^x" /></>}
      animated={true}
      extra={[
        { type: 'hline', y: 0, color: '#94a3b8' }, 
        { type: 'hline', y: 1, color: '#e0296e', dash: true },
        { type: 'point', x: 0, y: 1, color: '#dc2626' }
      ]}
    />
    <RB>La courbe admet l'axe des abscisses pour asymptote horizontale en <IM t="-\infty" /> et une tangente horizontale en <IM t="x=0" />.</RB>
  </Step>
</>)}

// ── T2-E1 ─────────────────────────────────────────────────────────────────────
function T2E1() { return (<>
  <Step index={0} title={<>Arbre pondéré de la situation</>}>
    <p>Soient les événements :</p>
    <ul>
      <li><IM t="A" /> : « la pièce provient de la machine <IM t="A" /> » avec <IM t="p(A) = 0{,}60" /></li>
      <li><IM t="B" /> : « la pièce provient de la machine <IM t="B" /> » avec <IM t="p(B) = 0{,}40" /></li>
      <li><IM t="D" /> : « la pièce est défectueuse »</li>
    </ul>
    <p>Les probabilités conditionnelles données sont : <BM t={T.T2E1_Cond} /></p>
    <ProbabilityTree />
    <RB>L'arbre est complet et pondéré comme ci-dessus. ✓</RB>
  </Step>
  <Step index={1} title={<>Probabilité que la pièce soit défectueuse</>}>
    <p>D'après la formule des probabilités totales :</p>
    <BM t={T.T2E1_PT} />
    <BM t={T.T2E1_PT2} />
    <RB>La probabilité qu'une pièce choisie au hasard soit défectueuse est <IM t="0{,}042" /> (soit <IM t="4{,}2\,\%" />). ✓</RB>
  </Step>
  <Step index={2} title={<>Probabilité conditionnelle (Formule de Bayes)</>}>
    <p>Sachant que la pièce prélevée est défectueuse, la probabilité qu'elle provienne de la machine <IM t="A" /> est :</p>
    <BM t={T.T2E1_Bayes} />
    <BM t={T.T2E1_Bayes2} />
    <RB>La probabilité est d'environ <IM t="71{,}4\,\%" /> (exactement <IM t="\frac{5}{7}" />). ✓</RB>
  </Step>
  <Step index={3} title={<>Loi binomiale de la variable aléatoire <IM t="X" /></>}>
    <p>On prélève au hasard 10 pièces de façon indépendante (tirage assimilé à un tirage avec remise). Chaque tirage est une épreuve de Bernoulli de succès <IM t="D" /> de probabilité <IM t="p = 0{,}042" />.</p>
    <p>La variable aléatoire <IM t="X" /> représentant le nombre de pièces défectueuses suit la loi binomiale :</p>
    <BM t={T.T2E1_Bin} />
    <RB>La loi est <IM t="\mathcal{B}(10\,;\; 0{,}042)" />. ✓</RB>
  </Step>
  <Step index={4} title={<>Probabilité d'avoir aucune pièce défectueuse</>}>
    <p>L'événement « n'avoir aucune pièce défectueuse » correspond à <IM t="X = 0" /> :</p>
    <BM t={T.T2E1_X0} />
    <RB>La probabilité est d'environ <IM t="0{,}649" /> (soit <IM t="64{,}9\,\%" />). ✓</RB>
  </Step>
  <Step index={5} title={<>Espérance mathématique de <IM t="X" /></>}>
    <p>Par définition de l'espérance d'une loi binomiale :</p>
    <BM t={T.T2E1_EX} />
    <RB>En moyenne, on s'attend à trouver <IM t="0{,}42" /> pièce défectueuse sur un échantillon de 10. ✓</RB>
  </Step>
  <Step index={6} title={<>Calcul de <IM t="p_n" /> et valeur minimale de <IM t="n" /></>}>
    <p>Pour un lot de <IM t="n" /> pièces (<IM t="n \ge 2" />), la probabilité d'avoir au moins une pièce défectueuse est :</p>
    <BM t={T.T2E1_pn} />
    <p>Nous cherchons le plus petit entier <IM t="n" /> tel que <IM t="p_n \ge 0{,}99" /> :</p>
    <BM t={T.T2E1_n_ineq} />
    <p>Puisque <IM t="\ln(0{,}958) < 0" />, le sens de l'inégalité change :</p>
    <BM t={T.T2E1_n_res} />
    <RB>La plus petite valeur d'entier cherchée est <IM t="n = 108" />. ✓</RB>
  </Step>
</>)}

// ── T2-E2 ─────────────────────────────────────────────────────────────────────
function T2E2() { 
  return (<>
  <Step index={0} title={<>Résolution de l'équation <IM t="(\mathcal{E}_1) : z^2 + (2+i)z + i = 0" /></>}>
    <p>Calculons le discriminant :</p>
    <BM t={T.T2E2_delta} />
    <p>Les deux solutions complexes de <IM t="(\mathcal{E}_1)" /> sont :</p>
    <BM t={T.T2E2_sols1} />
    <RB>Les solutions sont <IM t="z_1'" /> et <IM t="z_2'" />. ✓</RB>
  </Step>
  <Step index={1} title={<>Résolution de l'équation <IM t="(\mathcal{E}) : z^3 + (1+i)z^2 - 2z - i = 0" /></>}>
    <div className="section-label">a) Vérification que 1 est solution</div>
    <BM t={T.T2E2_verif} />
    <p>Le nombre 1 est bien solution. ✓</p>
    
    <div className="section-label">b) Détermination de <IM t="a" /> et <IM t="b" /> par identification</div>
    <p>En développant le second membre :</p>
    <BM t={T.T2E2_id} />
    <p>On identifie avec <IM t="z^3 + (1+i)z^2 - 2z - i" /> :</p>
    <BM t={T.T2E2_sys} />
    <p>D'où la factorisation :</p>
    <BM t={T.T2E2_factor} />
    
    <div className="section-label">c) Ensemble des solutions de <IM t="(\mathcal{E})" /></div>
    <BM t={T.T2E2_sols} />
    <RB>L'équation <IM t="(\mathcal{E})" /> admet trois solutions : <IM t="1" />, <IM t="z_1'" /> et <IM t="z_2'" />. ✓</RB>
  </Step>
  <Step index={2} title={<>Forme exponentielle de <IM t="z_A" /> et <IM t="z_B" /> et Cercle unité</>}>
    <p>Soient <IM t="z_A = \frac{\sqrt{3}}{2} - \frac{1}{2}i" /> et <IM t="z_B = -\frac{\sqrt{3}}{2} - \frac{1}{2}i" /> :</p>
    <IB label="Calcul de z_A"><BM t={T.T2E2_expA} /></IB>
    <IB label="Calcul de z_B"><BM t={T.T2E2_expB} /></IB>
    <BM t={T.T2E2_cer} />
    <RB>Les points <IM t="A" /> et <IM t="B" /> appartiennent au cercle trigonométrique de centre <IM t="O" /> et de rayon 1. ✓</RB>
  </Step>
  <Step index={3} title={<>Nature des quadrilatères <IM t="OEAC" /> et <IM t="OFBC" /></>}>
    <p>On donne <IM t="z_C = 1" />, <IM t="z_E = z_A - 1" /> et <IM t="z_F = z_B - 1" />.</p>
    <IB label="Pour OEAC"><BM t={T.T2E2_OEAC} /></IB>
    <IB label="Pour OFBC"><BM t={T.T2E2_OFBC} /></IB>
    <p>Puisque les affixes des vecteurs sont égales, <IM t="\vect{OE} = \vect{CA}" /> et <IM t="\vect{OF} = \vect{CB}" />.</p>
    <RB>Les quadrilatères <IM t="OEAC" /> et <IM t="OFBC" /> sont des parallélogrammes. ✓</RB>
  </Step>
  <Step index={4} title={<>Vérification des égalités trigonométriques</>}>
    <p>Démontrons les identités (avec correction de la coquille de l'énoncé) :</p>
    <IB label="Première égalité"><BM t={T.T2E2_trig1} /></IB>
    <IB label="Deuxième égalité"><BM t={T.T2E2_trig2} /></IB>
    <RB>Les égalités sont vérifiées. ✓</RB>
  </Step>
  <Step index={5} title={<>Forme exponentielle des solutions de <IM t="(\mathcal{E}_1)" /></>}>
    <p>Exprimons les formes exponentielles à partir des égalités précédentes :</p>
    <IB label="Forme de z_1'"><BM t={T.T2E2_exp1} /></IB>
    <IB label="Forme de z_2'"><BM t={T.T2E2_exp2} /></IB>
    <RB>Les formes exponentielles ont des modules strictement positifs. ✓</RB>
  </Step>
</>)}

// ── T2-E3 ─────────────────────────────────────────────────────────────────────
function T2E3() { 
  return (<>
  <Step index={0} title={<>Plans parallèles <IM t="P" /> et <IM t="Q" /></>}>
    <p>Soient les plans <IM t="P : x + y - z - 5 = 0" /> et <IM t="Q : x + y - z + 7 = 0" /> :</p>
    <BM t={T.T2E3_normal} />
    <RB>Les deux plans sont strictement parallèles (vecteurs normaux colinéaires et constantes distinctes). ✓</RB>
  </Step>
  <Step index={1} title={<>Justification de la sphère <IM t="S" /></>}>
    <p>Équation cartésienne : <IM t="x^2 + y^2 + z^2 - 2x - 4y - 2z + 1 = 0" /></p>
    <BM t={T.T2E3_sph} />
    <RB>Il s'agit de la sphère de centre <IM t="I(1, 2, 1)" /> et de rayon <IM t="R = \sqrt{5}" />. ✓</RB>
  </Step>
  <Step index={2} title={<>Intersection <IM t="P \cap S" /> (Cercle)</>}>
    <p>Calculons la distance de <IM t="I" /> au plan <IM t="P" /> :</p>
    <BM t={T.T2E3_dIP} />
    <p>Puisque <IM t="d(I,P) < R" />, l'intersection est un cercle <IM t="\mathscr{C}" />.</p>
    <IB label="Centre J du cercle"><BM t={T.T2E3_proj} /> ⟹ J(2, 3, 0)</IB>
    <IB label="Rayon r du cercle"><BM t={T.T2E3_rayon} /></IB>
    <RB>L'intersection <IM t="P \cap S" /> est le cercle <IM t="\mathscr{C}" /> de centre <IM t="J(2,3,0)" /> et de rayon <IM t="r = \sqrt{2}" />. ✓</RB>
  </Step>
  <Step index={3} title={<>Intersection <IM t="Q \cap S" /> (Vide)</>}>
    <p>Calculons la distance de <IM t="I" /> au plan <IM t="Q" /> :</p>
    <BM t={T.T2E3_dIQ} />
    <RB>Puisque <IM t="d(I,Q) = 3\sqrt{3} > \sqrt{5}" />, le plan <IM t="Q" /> ne coupe pas la sphère. L'intersection est vide : <IM t="Q \cap S = \emptyset" />. ✓</RB>
  </Step>
  <Step index={4} title={<>Produit vectoriel <IM t="\vect{AB} \wedge \vect{AC}" /> et produit scalaire</>}>
    <p>Soient <IM t="A(0,0,1)" />, <IM t="B(0,1,2)" /> et <IM t="C(2,2,5)" /> :</p>
    <IB label="Produit vectoriel"><BM t={T.T2E3_prod_vec} /></IB>
    <IB label="Produit scalaire avec AM"><BM t={T.T2E3_prod_scal} /></IB>
    <RB>Le produit scalaire est égal à <IM t="2(x + y - z + 1)" />. ✓</RB>
  </Step>
  <Step index={5} title={<>Volume et ensemble de points <IM t="M" /></>}>
    <p>Le volume du tétraèdre <IM t="ABCM" /> est :</p>
    <BM t={T.T2E3_vol} />
    <p>On cherche <IM t="M \in S" /> tel que <IM t="V = 2" /> :</p>
    <BM t={T.T2E3_vol_res} />
    <p>L'ensemble cherché est donc <IM t="S \cap (P \cup Q) = (S \cap P) \cup (S \cap Q)" />.</p>
    <RB>Puisque <IM t="Q \cap S = \emptyset" />, l'ensemble des points est exactement le cercle <IM t="\mathscr{C}" />. ✓</RB>
  </Step>
</>)}

// ── T2-E4 ─────────────────────────────────────────────────────────────────────
function T2E4() { 
  const f24 = x => Math.log(1 + Math.exp(x)) - Math.exp(x)/(1 + Math.exp(x))
  const d24 = x => x - 1
  const bisector = x => x
  const tangent = x => 0.25 * x + Math.log(2) - 0.5
  return (<>
  <Step index={0} title={<>Limite en <IM t="-\infty" /> et Asymptote horizontale</>}>
    <p>Étudions la limite en <IM t="-\infty" /> de <IM t="f(x) = \ln(1+e^x) - \frac{e^x}{1+e^x}" /> :</p>
    <BM t={T.T2E4_limM} />
    <RB>La droite d'équation <IM t="y = 0" /> (l'axe des abscisses) est une asymptote horizontale en <IM t="-\infty" />. ✓</RB>
  </Step>
  <Step index={1} title={<>Expression alternative et Limite en <IM t="+\infty" /></>}>
    <div className="section-label">a) Démontrer l'identité algébrique</div>
    <BM t={T.T2E4_f_alt} />
    <div className="section-label">b) Limite en <IM t="+\infty" /></div>
    <BM t={T.T2E4_limP} />
    <RB>La limite en <IM t="+\infty" /> est <IM t="+\infty" />. ✓</RB>
  </Step>
  <Step index={2} title={<>Asymptote oblique <IM t="(\Delta)" /> et Position relative</>}>
    <div className="section-label">c) Asymptote oblique en <IM t="+\infty" /></div>
    <BM t={T.T2E4_asymp} />
    <p>La droite <IM t="(\Delta) : y = x - 1" /> est asymptote oblique au voisinage de <IM t="+\infty" />. ✓</p>
    <div className="section-label">d) Position relative de la courbe <IM t="(\mathcal{C})" /> et <IM t="(\Delta)" /></div>
    <BM t={T.T2E4_pos} />
    <RB>La courbe <IM t="(\mathcal{C})" /> est strictly au-dessus de l'asymptote <IM t="(\Delta)" /> sur <IM t="\mathbb{R}" />. ✓</RB>
  </Step>
  <Step index={3} title={<>Dérivée et Tableau de Variations</>}>
    <p>La dérivée de la fonction <IM t="f" /> est :</p>
    <BM t={T.T2E4_fp} />
    <p>Puisque <IM t="f'(x) > 0" /> pour tout réel <IM t="x" />, la fonction <IM t="f" /> est strictement croissante.</p>
    <VariationTable
      xVals={[{ tex: '-\\infty' }, { tex: '+\\infty' }]}
      signs={['+']}
      arrows={['up']}
      fVals={[{ tex: '0', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
    />
    <RB>La fonction est strictement croissante sur <IM t="\mathbb{R}" />. ✓</RB>
  </Step>
  <Step index={4} title={<>Équation de la tangente <IM t="(T)" /> en 0</>}>
    <p>La tangente à <IM t="(\mathcal{C})" /> au point d'abscisse 0 est :</p>
    <BM t={T.T2E4_tang} />
    <RB>L'équation de la tangente <IM t="(T)" /> est <IM t="y = \frac{1}{4}x + \ln 2 - \frac{1}{2}" />. ✓</RB>
  </Step>
  <Step index={5} title={<>Étude de <IM t="g(x) = f(x) - x" /> et unique point fixe <IM t="\alpha" /></>}>
    <div className="section-label">a) Dérivée de g et g(ln 2)</div>
    <BM t={T.T2E4_g} />
    <BM t={T.T2E4_g_val} />
    <div className="section-label">b) Théorème des valeurs intermédiaires</div>
    <BM t={T.T2E4_alpha} />
    <RB>Il existe un unique point fixe <IM t="\alpha \in [0, \ln 2]" /> tel que <IM t="f(\alpha) = \alpha" /> (avec <IM t="\alpha \approx 0{,}193" />). ✓</RB>
  </Step>
  <Step index={6} title={<>Étude de la suite récurrente <IM t="(u_n)" /></>}>
    <p>Soit la suite définie par :</p>
    <BM t={T.T2E4_suite_rec} />
    <IB label="a) Encadrement par récurrence"><BM t={T.T2E4_suite_enc} /></IB>
    <IB label="b) Monotonie par récurrence"><BM t={T.T2E4_suite_crois} /></IB>
    <IB label="c) Convergence et limite"><BM t={T.T2E4_suite_lim} /></IB>
    <RB>La suite <IM t="(u_n)" /> est strictement croissante, majorée, et sa limite est l'unique point fixe <IM t="\alpha" />. ✓</RB>
  </Step>
  <Step index={7} title={<>Représentation Graphique de <IM t="f(x)" />, <IM t="(\Delta)" />, <IM t="y=x" /> et <IM t="(T)" /></>}>
    <FunctionCurve
      fn={f24}
      xmin={-4} xmax={4} ymin={-2} ymax={4}
      xticks={[-4, -2, 0, 2, 4]}
      yticks={[-2, 0, 2, 4]}
      title={<>Courbe de f(x) = ln(1+e^x) - e^x/(1+e^x)</>}
      animated={true}
      extra={[
        { type: 'fn', fn: d24, color: '#e0296e', dash: true }, // Asymptote
        { type: 'fn', fn: bisector, color: '#64748b', dash: true }, // y = x
        { type: 'fn', fn: tangent, color: '#eab308' }, // Tangente
        { type: 'point', x: 0.193, y: 0.193, color: '#dc2626' } // Point fixe alpha
      ]}
    />
    <RB>La courbe représentative de la fonction s'approche de <IM t="y=0" /> en <IM t="-\infty" /> et de <IM t="y=x-1" /> en <IM t="+\infty" />. Le point fixe <IM t="\alpha" /> est à l'intersection avec la droite <IM t="y=x" />. ✓</RB>
  </Step>
</>)}

// ── T3-E1 ─────────────────────────────────────────────────────────────────────
function T3E1() {
  return (<>
    <Step index={0} title={<>Partie I - 1) Vérification de l'identité complexe</>}>
      <p>On souhaite montrer que pour tout réel <IM t="a \in [0, \pi]" /> :</p>
      <BM t="e^{2ia} - 2ie^{ia}\sin a = 1" />
      <IB label="Formule d'Euler">On utilise <IM t="\sin a = \dfrac{e^{ia} - e^{-ia}}{2i}" />, ce qui donne <IM t="2i\sin a = e^{ia} - e^{-ia}" /></IB>
      <p>Développons le terme de gauche :</p>
      <BM t="2ie^{ia}\sin a = e^{ia}(e^{ia} - e^{-ia}) = e^{2ia} - e^0 = e^{2ia} - 1" />
      <p>Par soustraction :</p>
      <BM t="e^{2ia} - 2ie^{ia}\sin a = e^{2ia} - (e^{2ia} - 1) = 1" />
      <RB>L'égalité est bien vérifiée ✓</RB>
    </Step>
    <Step index={1} title={<>Partie I - 2) Résolution de l'équation du second degré</>}>
      <p>Résolvons dans <IM t="\mathbb{C}" /> :</p>
      <BM t="z^2 - 2e^{ia}z + 2ie^{ia}\sin a = 0" />
      <IB label="Calcul du discriminant">On calcule <IM t="\Delta = b^2 - 4ac" /> :</IB>
      <BM t="\Delta = (-2e^{ia})^2 - 4(2ie^{ia}\sin a) = 4e^{2ia} - 8ie^{ia}\sin a = 4(e^{2ia} - 2ie^{ia}\sin a)" />
      <p>D'après la question précédente, le terme entre parenthèses vaut 1 :</p>
      <BM t="\Delta = 4 \times 1 = 4" />
      <p>Le discriminant admet pour racine carrée complexe <IM t="\delta = 2" />. Les solutions sont :</p>
      <BM t="z_1 = \dfrac{2e^{ia} + 2}{2} = e^{ia} + 1 \quad \text{et} \quad z_2 = \dfrac{2e^{ia} - 2}{2} = e^{ia} - 1" />
      <RB>Les solutions sont <IM t="S = \{e^{ia} - 1, \; e^{ia} + 1\}" /> ✓</RB>
    </Step>
    <Step index={2} title={<>Partie II - 1.a) Propriétés géométriques de M, M' et M''</>}>
      <p>Soient les affixes <IM t="z_M = e^{ia}" />, <IM t="z_{M'} = e^{ia} - 1" /> et <IM t="z_{M''} = e^{ia} + 1" />.</p>
      <IB label="Milieu de [M'M'']">L'affixe du milieu de <IM t="[M'M'']" /> est :</IB>
      <BM t="\dfrac{z_{M'} + z_{M''}}{2} = \dfrac{(e^{ia} - 1) + (e^{ia} + 1)}{2} = \dfrac{2e^{ia}}{2} = e^{ia} = z_M" />
      <p>Donc <IM t="M" /> est bien le milieu du segment <IM t="[M'M'']" />.</p>
      <IB label="Vecteur \overrightarrow{MM'}">Calculons l'affixe du vecteur <IM t="\overrightarrow{MM'}" /> :</IB>
      <BM t="z_{M'} - z_M = (e^{ia} - 1) - e^{ia} = -1" />
      <p>Puisque le vecteur unitaire <IM t="\vec{u}" /> a pour affixe 1, on a :</p>
      <BM t="\overrightarrow{MM'} = -\vec{u}" />
      <RB><IM t="M" /> est le milieu de <IM t="[M'M'']" /> et <IM t="\overrightarrow{MM'} = -\vec{u}" /> ✓</RB>
    </Step>
    <Step index={3} title={<>Partie II - 1.b) Construction géométrique pour a ∈ ]0, π/6[</>}>
      <p>Puisque <IM t="a \in \left]0, \frac{\pi}{6}\right[" />, le point <IM t="M = e^{ia}" /> est situé sur le cercle trigonométrique dans le premier quadrant (angle aigu faible).</p>
      <p>Les points <IM t="M'" /> et <IM t="M''" /> se déduisent de <IM t="M" /> par des translations horizontales de vecteur <IM t="-\vec{u}" /> et <IM t="\vec{u}" /> respectively (car <IM t="M" /> est le milieu de <IM t="[M'M'']" /> et <IM t="\overrightarrow{MM'} = -\vec{u}" />).</p>
      <RB>Pour construire <IM t="M'" /> et <IM t="M''" />, on trace la droite horizontale passant par <IM t="M" /> et on place les points à une distance de 1 à gauche et à droite de <IM t="M" /> ✓</RB>
    </Step>
    <Step index={4} title={<>Partie II - 2.a) Triangle OM'M'' rectangle</>}>
      <IB label="Longueur OM">On a <IM t="OM = |z_M| = |e^{ia}| = 1" /></IB>
      <IB label="Longueur M'M''">On a <IM t="M'M'' = |z_{M''} - z_{M'}| = |(e^{ia}+1) - (e^{ia}-1)| = |2| = 2" /></IB>
      <p>On constate que :</p>
      <BM t="OM = 1 = \dfrac{1}{2} M'M''" />
      <p>Dans le triangle <IM t="OM'M''" />, la longueur de la médiane issue de <IM t="O" /> est égale à la moitié de la longueur du côté opposé <IM t="[M'M'']" />.</p>
      <RB>Le triangle <IM t="OM'M''" /> est donc rectangle en <IM t="O" /> ✓</RB>
    </Step>
    <Step index={5} title={<>Partie II - 2.b) Condition pour que le triangle soit isoscèle</>}>
      <p>Puisque le triangle est rectangle en <IM t="O" />, il est isoscèle en <IM t="O" /> si et seulement si les longueurs des deux côtés de l'angle droit sont égales, soit <IM t="OM' = OM''" /> (ou <IM t="OM'^2 = OM''^2" />) :</p>
      <BM t="OM'^2 = |e^{ia} - 1|^2 = (\cos a - 1)^2 + \sin^2 a = \cos^2 a - 2\cos a + 1 + \sin^2 a = 2 - 2\cos a" />
      <BM t="OM''^2 = |e^{ia} + 1|^2 = (\cos a + 1)^2 + \sin^2 a = \cos^2 a + 2\cos a + 1 + \sin^2 a = 2 + 2\cos a" />
      <p>L'égalité des longueurs donne :</p>
      <BM t="2 - 2\cos a = 2 + 2\cos a \iff 4\cos a = 0 \iff \cos a = 0" />
      <p>Comme <IM t="a \in [0, \pi]" />, l'unique solution est :</p>
      <BM t="a = \dfrac{\pi}{2}" />
      <RB>Le triangle <IM t="OM'M''" /> est rectangle isoscèle si et seulement si <IM t="a = \frac{\pi}{2}" /> ✓</RB>
    </Step>
  </>)
}

// ── T3-E2 ─────────────────────────────────────────────────────────────────────
function T3E2() {
  return (<>
    <Step index={0} title={<>1.a) Composantes de le produit vectoriel</>}>
      <p>On donne les points <IM t="A(-1,-1,3)" />, <IM t="B(0,-3,1)" /> et <IM t="C(-3,0,1)" />. Déterminons les vecteurs :</p>
      <BM t="\overrightarrow{AB} = \begin{pmatrix} 0 - (-1) \\ -3 - (-1) \\ 1 - 3 \end{pmatrix} = \begin{pmatrix} 1 \\ -2 \\ -2 \end{pmatrix} \quad \text{et} \quad \overrightarrow{AC} = \begin{pmatrix} -3 - (-1) \\ 0 - (-1) \\ 1 - 3 \end{pmatrix} = \begin{pmatrix} -2 \\ 1 \\ -2 \end{pmatrix}" />
      <p>Calculons le produit vectoriel <IM t="\overrightarrow{AB} \wedge \overrightarrow{AC}" /> :</p>
      <BM t="\overrightarrow{AB} \wedge \overrightarrow{AC} = \begin{pmatrix} 1 \\ -2 \\ -2 \end{pmatrix} \wedge \begin{pmatrix} -2 \\ 1 \\ -2 \end{pmatrix} = \begin{pmatrix} (-2)(-2) - (-2)(1) \\ (-2)(-2) - (1)(-2) \\ (1)(1) - (-2)(-2) \end{pmatrix} = \begin{pmatrix} 4 + 2 \\ 4 + 2 \\ 1 - 4 \end{pmatrix} = \begin{pmatrix} 6 \\ 6 \\ -3 \end{pmatrix}" />
      <RB>Le produit vectoriel a pour coordonnées <IM t="\begin{pmatrix} 6 \\ 6 \\ -3 \end{pmatrix}" /> ✓</RB>
    </Step>
    <Step index={1} title={<>1.b) Détermination du plan P</>}>
      <p>Le produit vectoriel <IM t="\overrightarrow{AB} \wedge \overrightarrow{AC}" /> est un vecteur non nul.</p>
      <p>Cela prouve que les vecteurs <IM t="\overrightarrow{AB}" /> et <IM t="\overrightarrow{AC}" /> ne sont pas colinéaires.</p>
      <RB>Les points <IM t="A" />, <IM t="B" /> et <IM t="C" /> ne sont pas alignés, ils définissent donc de manière unique un plan <IM t="P" /> ✓</RB>
    </Step>
    <Step index={2} title={<>1.c) Équation cartésienne du plan P</>}>
      <p>Le vecteur <IM t="\overrightarrow{AB} \wedge \overrightarrow{AC} = \begin{pmatrix} 6 \\ 6 \\ -3 \end{pmatrix}" /> est normal au plan <IM t="P" />. On peut simplifier en prenant le vecteur normal colinéaire :</p>
      <BM t="\vec{n} = \dfrac{1}{3} \begin{pmatrix} 6 \\ 6 \\ -3 \end{pmatrix} = \begin{pmatrix} 2 \\ 2 \\ -1 \end{pmatrix}" />
      <p>L'équation de <IM t="P" /> s'écrit sous la forme <IM t="2x + 2y - z + d = 0" />. On utilise le point <IM t="A(-1,-1,3) \in P" /> :</p>
      <BM t="2(-1) + 2(-1) - 3 + d = 0 \iff -2 - 2 - 3 + d = 0 \iff -7 + d = 0 \iff d = 7" />
      <RB>Une équation cartésienne de <IM t="P" /> est bien <IM t="2x + 2y - z + 7 = 0" /> ✓</RB>
    </Step>
    <Step index={3} title={<>2.a) Sphère S : Centre et Rayon</>}>
      <p>La sphère <IM t="S" /> a pour équation :</p>
      <BM t="x^2 + y^2 + z^2 - 6x + 2y - 4z - 11 = 0" />
      <p>Regroupons les termes sous forme canonique :</p>
      <BM t="(x-3)^2 - 9 + (y+1)^2 - 1 + (z-2)^2 - 4 - 11 = 0" />
      <BM t="(x-3)^2 + (y+1)^2 + (z-2)^2 = 25" />
      <RB>La sphère <IM t="S" /> est de centre <IM t="I(3, -1, 2)" /> et de rayon <IM t="R = \sqrt{25} = 5" /> ✓</RB>
    </Step>
    <Step index={4} title={<>2.b) Intersection du plan P avec la sphère S</>}>
      <IB label="Distance du centre I au plan P">Calculons la distance de <IM t="I(3,-1,2)" /> à <IM t="P : 2x+2y-z+7=0" /> :</IB>
      <BM t="d(I, P) = \dfrac{|2(3) + 2(-1) - (2) + 7|}{\sqrt{2^2 + 2^2 + (-1)^2}} = \dfrac{|6 - 2 - 2 + 7|}{\sqrt{9}} = \dfrac{9}{3} = 3" />
      <p>Puisque la distance <IM t="d(I,P) = 3 < R = 5" />, le plan <IM t="P" /> coupe la sphère <IM t="S" /> suivant un cercle <IM t="(\zeta)" />.</p>
      <IB label="Rayon du cercle">Le rayon du cercle est :</IB>
      <BM t="r = \sqrt{R^2 - d(I,P)^2} = \sqrt{5^2 - 3^2} = \sqrt{16} = 4" />
      <IB label="Centre H du cercle">Le centre <IM t="H" /> est le projeté orthogonal de <IM t="I" /> sur <IM t="P" />. La droite passant par <IM t="I" /> orthogonale à <IM t="P" /> a pour représentation :</IB>
      <BM t="\begin{cases} x = 3 + 2t \\ y = -1 + 2t \\ z = 2 - t \end{cases} \quad (t \in \mathbb{R})" />
      <p>Remplaçons dans l'équation de <IM t="P" /> :</p>
      <BM t="2(3+2t) + 2(-1+2t) - (2-t) + 7 = 0 \iff 9t + 9 = 0 \iff t = -1" />
      <p>En remplaçant <IM t="t = -1" /> dans la représentation de la droite, on obtient le point <IM t="H" /> :</p>
      <BM t="x_H = 3-2 = 1, \quad y_H = -1-2 = -3, \quad z_H = 2-(-1) = 3" />
      <RB>L'intersection est le cercle <IM t="(\zeta)" /> de centre <IM t="H(1, -3, 3)" /> et de rayon <IM t="r = 4" /> ✓</RB>
    </Step>
    <Step index={5} title={<>3.a) Plans perpendiculaires</>}>
      <p>Le plan <IM t="Q" /> a pour équation <IM t="x - 2y - 2z + 11 = 0" />, de vecteur normal <IM t="\vec{n}_Q = \begin{pmatrix} 1 \\ -2 \\ -2 \end{pmatrix}" />.</p>
      <p>Le plan <IM t="P" /> a pour vecteur normal <IM t="\vec{n}_P = \begin{pmatrix} 2 \\ 2 \\ -1 \end{pmatrix}" />. Calculons le produit scalaire :</p>
      <BM t="\vec{n}_P \cdot \vec{n}_Q = 2(1) + 2(-2) + (-1)(-2) = 2 - 4 + 2 = 0" />
      <RB>Les vecteurs normaux étant orthogonaux, les plans <IM t="P" /> et <IM t="Q" /> sont perpendiculaires ✓</RB>
    </Step>
    <Step index={6} title={<>3.b) Représentation paramétrique de la droite d'intersection Δ</>}>
      <p>La droite <IM t="\Delta = P \cap Q" /> est définie par le système :</p>
      <BM t="\begin{cases} 2x + 2y - z + 7 = 0 \\ x - 2y - 2z + 11 = 0 \end{cases}" />
      <p>Vérifions que les coordonnées paramétriques proposées <IM t="x = -1 - 2\alpha" />, <IM t="y = \alpha" />, <IM t="z = 5 - 2\alpha" /> satisfont les deux équations :</p>
      <p>Dans <IM t="P" /> : <IM t="2(-1-2\alpha) + 2(\alpha) - (5-2\alpha) + 7 = -2 - 4\alpha + 2\alpha - 5 + 2\alpha + 7 = 0" /> (Vérifié)</p>
      <p>Dans <IM t="Q" /> : <IM t="(-1-2\alpha) - 2(\alpha) - 2(5-2\alpha) + 11 = -1 - 2\alpha - 2\alpha - 10 + 4\alpha + 11 = 0" /> (Vérifié)</p>
      <RB>La représentation paramétrique de <IM t="\Delta" /> est correcte ✓</RB>
    </Step>
    <Step index={7} title={<>3.c) Distance du centre H à la droite Δ</>}>
      <p>Prenons un point de <IM t="\Delta" /> pour <IM t="\alpha = 0" /> : <IM t="A_0(-1, 0, 5)" />, et le vecteur directeur de la droite <IM t="\vec{u}_{\Delta} = \begin{pmatrix} -2 \\ 1 \\ -2 \end{pmatrix}" /> (norme <IM t="\|\vec{u}_{\Delta}\| = \sqrt{4+1+4} = 3" />).</p>
      <p>Calculons le vecteur <IM t="\overrightarrow{A_0H} = \begin{pmatrix} 1 - (-1) \\ -3 - 0 \\ 3 - 5 \end{pmatrix} = \begin{pmatrix} 2 \\ -3 \\ -2 \end{pmatrix}" />.</p>
      <p>Le produit vectoriel <IM t="\overrightarrow{A_0H} \wedge \vec{u}_{\Delta}" /> vaut :</p>
      <BM t="\overrightarrow{A_0H} \wedge \vec{u}_{\Delta} = \begin{pmatrix} 2 \\ -3 \\ -2 \end{pmatrix} \wedge \begin{pmatrix} -2 \\ 1 \\ -2 \end{pmatrix} = \begin{pmatrix} 8 \\ 8 \\ -4 \end{pmatrix}" />
      <p>La norme de ce produit vectoriel est <IM t="\sqrt{8^2 + 8^2 + (-4)^2} = \sqrt{144} = 12" />. La distance est :</p>
      <BM t="d(H, \Delta) = \dfrac{\|\overrightarrow{A_0H} \wedge \vec{u}_{\Delta}\|}{\|\vec{u}_{\Delta}\|} = \dfrac{12}{3} = 4" />
      <RB>La distance de <IM t="H" /> à <IM t="\Delta" /> est égale à 4 ✓</RB>
    </Step>
    <Step index={8} title={<>3.d) Tangente au cercle (ζ)</>}>
      <p>Puisque la distance de <IM t="H" /> (le centre du cercle <IM t="(\zeta)" />) à la droite <IM t="\Delta" /> est égale à son rayon <IM t="r = 4" />, la droite <IM t="\Delta" /> est tangente au cercle <IM t="(\zeta)" /> dans le plan <IM t="P" />.</p>
      <p>Calculons le point de contact <IM t="J" />, projeté orthogonal de <IM t="H" /> sur <IM t="\Delta" />. On cherche le paramètre <IM t="\alpha" /> tel que <IM t="\overrightarrow{HJ} \cdot \vec{u}_{\Delta} = 0" /> :</p>
      <BM t="\overrightarrow{HJ} = \begin{pmatrix} -1-2\alpha-1 \\ \alpha - (-3) \\ 5-2\alpha-3 \end{pmatrix} = \begin{pmatrix} -2-2\alpha \\ \alpha+3 \\ 2-2\alpha \end{pmatrix}" />
      <BM t="\overrightarrow{HJ} \cdot \vec{u}_{\Delta} = -2(-2-2\alpha) + 1(\alpha+3) - 2(2-2\alpha) = 4 + 4\alpha + \alpha + 3 - 4 + 4\alpha = 9\alpha + 3 = 0 \iff \alpha = -\dfrac{1}{3}" />
      <p>En remplaçant <IM t="\alpha = -1/3" /> dans les coordonnées de la droite, on trouve :</p>
      <BM t="J\left(-1 - 2\left(-\frac{1}{3}\right), \; -\frac{1}{3}, \; 5 - 2\left(-\frac{1}{3}\right)\right) = J\left(-\dfrac{1}{3}, \; -\dfrac{1}{3}, \; \dfrac{17}{3}\right)" />
      <RB>La droite <IM t="\Delta" /> est tangente à <IM t="(\zeta)" /> au point <IM t="J\left(-\frac{1}{3}, -\frac{1}{3}, \frac{17}{3}\right)" /> ✓</RB>
    </Step>
  </>)
}

// ── T3-E3 ─────────────────────────────────────────────────────────────────────
function T3E3() {
  return (<>
    <Step index={0} title="1.a) Démonstration par récurrence : u_n > 1">
      <Rec
        prop={<><IM t="P(n)" /> : <IM t="u_n > 1" /></>}
        verif={<><p>Pour <IM t="n = 0" /> : <IM t="u_0 = 2 > 1" /> (Vrai) ✓</p></>}
        suppo={<><p>Supposons que pour un entier <IM t="n" /> fixé, on a <IM t="u_n > 1" />.</p></>}
        demo={<>
          <p>Étudions <IM t="u_{n+1} - 1" /> :</p>
          <BM t="u_{n+1} - 1 = \dfrac{2u_n - 1}{u_n} - 1 = \dfrac{2u_n - 1 - u_n}{u_n} = \dfrac{u_n - 1}{u_n}" />
          <p>Par hypothèse de récurrence, <IM t="u_n > 1" />, donc le numérateur <IM t="u_n - 1 > 0" /> et le dénominateur <IM t="u_n > 0" />.</p>
          <p>Par quotient, on obtient <IM t="u_{n+1} - 1 > 0" /> soit <IM t="u_{n+1} > 1" />. (Vérifié)</p>
        </>}
      />
      <RB>Par récurrence, <IM t="u_n > 1" /> pour tout entier naturel <IM t="n" /> ✓</RB>
    </Step>
    <Step index={1} title={<>1.b) Différence U_{n+1} - U_n</>}>
      <p>Calculons la différence pour tout entier naturel <IM t="n" /> :</p>
      <BM t="u_{n+1} - u_n = \dfrac{2u_n - 1}{u_n} - u_n = \dfrac{2u_n - 1 - u_n^2}{u_n} = \dfrac{-(u_n^2 - 2u_n + 1)}{u_n} = \dfrac{-(u_n - 1)^2}{u_n}" />
      <RB>On obtient bien <IM t="u_{n+1} - u_n = \dfrac{-(u_n - 1)^2}{u_n}" /> ✓</RB>
    </Step>
    <Step index={2} title={<>1.c) Monotonie, Convergence et Limite</>}>
      <p>Puisque pour tout <IM t="n" />, <IM t="u_n > 1" />, le dénominateur <IM t="u_n" /> est strictement positif, et le numérateur <IM t="-(u_n - 1)^2" /> est négatif ou nul.</p>
      <p>Ainsi, <IM t="u_{n+1} - u_n \leqslant 0" /> : la suite <IM t="(u_n)" /> est décroissante.</p>
      <p>La suite étant décroissante et minorée par 1, elle est convergente vers une limite finie <IM t="\ell \geqslant 1" />.</p>
      <p>Puisque la fonction de récurrence <IM t="f(x) = 2 - \frac{1}{x}" /> est continue sur <IM t="[1, +\infty[" />, la limite <IM t="\ell" /> vérifie l'équation du point fixe :</p>
      <BM t="\ell = 2 - \dfrac{1}{\ell} \iff \ell^2 - 2\ell + 1 = 0 \iff (\ell - 1)^2 = 0 \iff \ell = 1" />
      <RB>La suite <IM t="(u_n)" /> converge vers <IM t="\ell = 1" /> ✓</RB>
    </Step>
    <Step index={3} title={<>2.a) Suite (v_n) arithmétique</>}>
      <p>Soit <IM t="v_n = \dfrac{1}{u_n - 1}" />. Calculons <IM t="v_{n+1}" /> :</p>
      <BM t="v_{n+1} = \dfrac{1}{u_{n+1} - 1} = \dfrac{1}{\frac{u_n - 1}{u_n}} = \dfrac{u_n}{u_n - 1}" />
      <p>Formons la différence <IM t="v_{n+1} - v_n" /> :</p>
      <BM t="v_{n+1} - v_n = \dfrac{u_n}{u_n - 1} - \dfrac{1}{u_n - 1} = \dfrac{u_n - 1}{u_n - 1} = 1" />
      <RB>La suite <IM t="(v_n)" /> est arithmétique de raison <IM t="r = 1" /> ✓</RB>
    </Step>
    <Step index={4} title={<>2.b-c) Expression de v_n et u_n</>}>
      <p>Le premier terme est <IM t="v_0 = \dfrac{1}{u_0 - 1} = \dfrac{1}{2-1} = 1" />.</p>
      <p>L'expression générale d'une suite arithmétique donne :</p>
      <BM t="v_n = v_0 + nr = 1 + n \times 1 = n + 1" />
      <p>Par ailleurs, <IM t="v_n = \dfrac{1}{u_n - 1} \iff u_n - 1 = \dfrac{1}{v_n} \iff u_n = 1 + \dfrac{1}{v_n}" />.</p>
      <BM t="u_n = 1 + \dfrac{1}{n + 1} = \dfrac{n + 2}{n + 1}" />
      <RB>On a <IM t="v_n = n + 1" /> et <IM t="u_n = \dfrac{n + 2}{n + 1}" /> ✓</RB>
    </Step>
    <Step index={5} title={<>3.a) Somme S_1</>}>
      <p>La somme est définie par <IM t="S_n = \ln(u_0) + \ln(u_1) + \dots + \ln(u_n)" />.</p>
      <BM t="S_1 = \ln(u_0) + \ln(u_1) = \ln(2) + \ln\left(\frac{3}{2}\right) = \ln\left(2 \times \frac{3}{2}\right) = \ln 3" />
      <RB>On obtient bien <IM t="S_1 = \ln 3" /> ✓</RB>
    </Step>
    <Step index={6} title={<>3.b-c) Formule générale de S_n et seuil</>}>
      <p>Exprimons la somme <IM t="S_n" /> à l'aide de la forme de <IM t="u_k" /> :</p>
      <BM t="S_n = \sum_{k=0}^n \ln(u_k) = \sum_{k=0}^n \ln\left(\dfrac{k+2}{k+1}\right) = \sum_{k=0}^n \left(\ln(k+2) - \ln(k+1)\right)" />
      <p>Par télescopage, tous les termes intermédiaires se simplifient :</p>
      <BM t="S_n = \ln(n+2) - \ln(1) = \ln(n+2)" />
      <p>Cherchons le plus petit entier naturel <IM t="n" /> tel que <IM t="S_n > 10" /> :</p>
      <BM t="\ln(n+2) > 10 \iff n+2 > e^{10} \iff n > e^{10} - 2" />
      <p>Puisque <IM t="e^{10} \approx 22026{,}46" />, on a <IM t="n > 22024{,}46" />.</p>
      <RB>Le plus petit entier naturel requis est <IM t="n = 22025" /> ✓</RB>
    </Step>
  </>)
}

// ── T3-E4 ─────────────────────────────────────────────────────────────────────
function T3E4() {
  const f3 = x => x + 1 - x * Math.exp(1 - x * x);
  return (<>
    <Step index={0} title={<>Partie I - 1) Croissance de la fonction auxiliaire g</>}>
      <p>Soit <IM t="g(x) = e^{x^2-1} + 2x^2 - 1" /> sur <IM t="[0, +\infty[" />.</p>
      <p>Sa dérivée est :</p>
      <BM t="g'(x) = 2x e^{x^2-1} + 4x = 2x(e^{x^2-1} + 2)" />
      <p>Pour tout <IM t="x > 0" />, <IM t="2x > 0" /> et <IM t="e^{x^2-1} + 2 > 0" />, donc <IM t="g'(x) > 0" />. Pour <IM t="x = 0" />, <IM t="g'(0) = 0" />.</p>
      <RB>La fonction <IM t="g" /> est strictement croissante sur <IM t="[0, +\infty[" /> ✓</RB>
    </Step>
    <Step index={1} title={<>Partie I - 2-3) Racine unique alpha et Signe de g</>}>
      <p>La fonction <IM t="g" /> est continue et strictement croissante sur <IM t="[0, +\infty[" />.</p>
      <BM t="g(0) = e^{-1} - 1 = \dfrac{1-e}{e} < 0 \quad \text{et} \quad \lim_{x\to+\infty} g(x) = +\infty" />
      <p>D'après le théorème des valeurs intermédiaires, l'équation <IM t="g(x) = 0" /> admet une unique solution <IM t="\alpha" /> dans <IM t="[0, +\infty[" />.</p>
      <IB label="Calculs de valeurs">On a :</IB>
      <BM t="g(0{,}51) \approx -0{,}0025 < 0 \quad \text{et} \quad g(0{,}52) \approx 0{,}0228 > 0" />
      <p>Donc <IM t="0{,}51 < \alpha < 0{,}52" />.</p>
      <RB>Signe : <IM t="g(x) < 0" /> sur <IM t="[0, \alpha[" />, <IM t="g(\alpha) = 0" />, et <IM t="g(x) > 0" /> sur <IM t="]\alpha, +\infty[" /> ✓</RB>
    </Step>
    <Step index={2} title={<>Partie II - 4) Centre de symétrie J(0, 1)</>}>
      <p>Soit <IM t="f(x) = x + 1 - x e^{1-x^2}" />.</p>
      <BM t="f(-x) = -x + 1 - (-x) e^{1-(-x)^2} = -x + 1 + x e^{1-x^2}" />
      <p>Calculons la somme :</p>
      <BM t="f(-x) + f(x) = (-x + 1 + x e^{1-x^2}) + (x + 1 - x e^{1-x^2}) = 2" />
      <p>La relation <IM t="f(-x) + f(x) = 2 \times 1" /> prouve géométriquement que :</p>
      <RB>Le point <IM t="J(0, 1)" /> est le centre de symétrie de la courbe <IM t="(\mathcal{C}_f)" /> ✓</RB>
    </Step>
    <Step index={3} title={<>Partie II - 5) Limite, Asymptote oblique et Position relative</>}>
      <IB label="Limite en +∞">Par croissances comparées, <IM t="\lim_{x\to+\infty} x e^{1-x^2} = \lim_{x\to+\infty} e \dfrac{x}{e^{x^2}} = 0" />, donc :</IB>
      <BM t="\lim_{x\to+\infty} f(x) = +\infty" />
      <IB label="Asymptote oblique">Considérons <IM t="f(x) - (x + 1) = -x e^{1-x^2}" />. On a :</IB>
      <BM t="\lim_{x\to+\infty} [f(x) - (x + 1)] = 0" />
      <p>Ainsi, la droite <IM t="(D) : y = x + 1" /> est asymptote oblique à la courbe en <IM t="+\infty" />.</p>
      <IB label="Position relative sur [0, +∞[">On étudie le signe de la différence <IM t="f(x) - (x + 1) = -x e^{1-x^2}" /> :</IB>
      <p>Pour <IM t="x > 0" />, la différence est strictement négative, la courbe est donc en dessous de <IM t="(D)" />.</p>
      <RB>La courbe <IM t="(\mathcal{C}_f)" /> coupe <IM t="(D)" /> en <IM t="J(0, 1)" /> et reste en dessous sur <IM t="]0, +\infty[" /> ✓</RB>
    </Step>
    <Step index={4} title={<>Partie II - 6) Dérivée et Variations</>}>
      <p>Dérivons la fonction sur <IM t="[0, +\infty[" /> :</p>
      <BM t="f'(x) = 1 - \left( 1 \cdot e^{1-x^2} + x \cdot (-2x) e^{1-x^2} \right) = 1 + (2x^2 - 1)e^{1-x^2}" />
      <p>Par ailleurs, calculons le produit :</p>
      <BM t="e^{1-x^2} g(x) = e^{1-x^2} \left( e^{x^2-1} + 2x^2 - 1 \right) = e^0 + (2x^2 - 1)e^{1-x^2} = 1 + (2x^2 - 1)e^{1-x^2} = f'(x)" />
      <p>Puisque <IM t="e^{1-x^2} > 0" />, le signe de <IM t="f'(x)" /> is celui de la fonction auxiliaire <IM t="g(x)" /> :</p>
      <div className="section-label">Tableau de variations sur [0, +∞[</div>
      <VariationTable
        xVals={[{ tex: '0' }, { tex: '\\alpha' }, { tex: '+\\infty' }]}
        signs={['-', '+']}
        arrows={['down', 'up']}
        fVals={[{ tex: '1', pos: 'top' }, { tex: 'f(\\alpha)', pos: 'bot' }, { tex: '+\\infty', pos: 'top' }]}
      />
      <RB>Par symétrie centrale par rapport à <IM t="J" />, la fonction est décroissante sur <IM t="[-\alpha, \alpha]" /> et croissante sur <IM t="]-\infty, -\alpha]" /> et sur <IM t="[\alpha, +\infty[" /> ✓</RB>
    </Step>
    <Step index={5} title={<>Partie II - 7) Tangente et Tracé de la courbe</>}>
      <p>L'équation de la tangente <IM t="(T)" /> en <IM t="J(0, 1)" /> est donnée par <IM t="y = f'(0)x + f(0)" />.</p>
      <BM t="f'(0) = 1 + (0 - 1)e^1 = 1 - e \approx -1{,}72" />
      <p>Ainsi, la tangente a pour équation :</p>
      <BM t="(T) : y = (1-e)x + 1" />
      <div className="section-label">Tracé de f(x)</div>
      <FunctionCurve
        fn={f3}
        xmin={-2.5} xmax={2.5} ymin={-2} ymax={4.5}
        xticks={[-2, -1, 0, 1, 2]} yticks={[-1, 0, 1, 2, 3, 4]}
        title="Courbe (Cf) et Asymptote (D)"
        extra={[
          { type: 'fn', fn: x => x + 1, color: '#e0296e' },
          { type: 'fn', fn: x => (1 - Math.E) * x + 1, color: '#f59e0b' },
          { type: 'point', x: 0, y: 1, color: '#7c3aed' }
        ]}
      />
    </Step>
    <Step index={6} title={<>Partie III - 8-10) Intégrale, Calcul d'Aire et Limite</>}>
      <IB label="Calcul de l'intégrale I(a)">On pose le changement de variable <IM t="u = 1 - x^2 \implies du = -2x dx" /> :</IB>
      <BM t="I(a) = \int_0^a x e^{1-x^2} dx = \left[ -\dfrac{1}{2} e^{1-x^2} \right]_0^a = \dfrac{1}{2}\left( e - e^{1-a^2} \right)" />
      <IB label="Aire A(a)">Puisque la courbe <IM t="(\mathcal{C}_f)" /> est en dessous de <IM t="(D)" /> sur <IM t="[0, a]" />, l'aire est :</IB>
      <BM t="\mathcal{A}(a) = \int_0^a [ (x+1) - f(x) ] dx = \int_0^a x e^{1-x^2} dx = I(a) = \dfrac{1}{2}\left( e - e^{1-a^2} \right) \text{ u.a.}" />
      <IB label="Limite quand a → +∞">On a <IM t="\lim_{a\to+\infty} e^{1-a^2} = 0" />, donc :</IB>
      <BM t="\lim_{a\to+\infty} \mathcal{A}(a) = \dfrac{e}{2} \text{ u.a.}" />
      <RB>Aire limite : <IM t="\dfrac{e}{2} \approx 1{,}36" /> unités d'aire ✓</RB>
    </Step>
  </>)
}

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
    <IB label="Vérification (n=0)"><BM t={T.T6E2_Init} /></IB>
    <IB label="Démonstration"><BM t={T.T6E2_Hered} /></IB>
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

// ── SUJET 11 ──────────────────────────────────────────────────────────────────
function T11E1() { return (<>
  <Step index={0} title="Équations dans C">
    <IB label="Vérification"><BM t={T.T11E1_a} /></IB>
    <RB><BM t={T.T11E1_b} /></RB>
    <RB><BM t={T.T11E1_sol} /></RB>
  </Step>
</>)}
function T11E2() { return (<>
  <Step index={0} title="Plans et Sphères">
    <IB label="Vecteur Normal"><BM t={T.T11E2_n} /></IB>
    <RB><BM t={T.T11E2_P} /></RB>
    <IB label="Sphère S"><BM t={T.T11E2_S} /></IB>
  </Step>
</>)}
function T11E3() { return (<>
  <Step index={0} title="Calcul Intégral">
    <RB><BM t={T.T11E3_I} /></RB>
    <RB><BM t={T.T11E3_J} /></RB>
  </Step>
</>)}
function T11E4() { return (<>
  <Step index={0} title="Étude de fonction">
    <IB label="Signe de g"><BM t={T.T11E4_g} /></IB>
    <RB><BM t={T.T11E4_fp} /></RB>
    <IB label="Tangente T"><BM t={T.T11E4_T} /></IB>
    <RB><BM t={T.T11E4_Un} /></RB>
  </Step>
</>)}

// ── SUJET 12 ──────────────────────────────────────────────────────────────────
function T12E1() { return (<>
  <Step index={0} title="Complexes — Équations">
    <RB><BM t={T.T12E1_det} /></RB>
    <RB><BM t={T.T12E1_sol} /></RB>
  </Step>
</>)}
function T12E2() { return (<>
  <Step index={0} title="Géométrie dans l'Espace">
    <IB label="Plan P"><BM t={T.T12E2_P} /></IB>
    <IB label="Sphère S"><BM t={T.T12E2_S} /></IB>
  </Step>
</>)}
function T12E3() { return (<>
  <Step index={0} title="Statistiques">
    <IB label="Corrélation"><BM t={T.T12E3_r} /></IB>
    <RB><BM t={T.T12E3_D} /></RB>
  </Step>
</>)}
function T12E4() { return (<>
  <Step index={0} title="Analyse — Problème">
    <IB label="Lien f-g"><BM t={T.T12E4_fp} /></IB>
    <RB><BM t={T.T12E4_asymp} /></RB>
    <RB><BM t={T.T12E4_Int} /></RB>
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
  <Step index={0} title="Graphes — QCM"><IB label="Réponses correctes">
    <BM t={"1)\\;c\\quad 2)\\;a\\quad 3)\\;b"} />
  </IB><RB><BM t={"4)\\;c"} /></RB></Step>
</>)}

function QCM_Corr({ subject, data }) {
  return (
    <div className="qcm-corr-grid">
      {data.map((res, i) => (
        <div key={i} className="qcm-corr-item">
          <span className="qcm-q-num">Question {i + 1}</span>
          <span className="qcm-q-ans"><IM t={res} /></span>
        </div>
      ))}
    </div>
  )
}

function Q1_Corr({ exo }) {
  const data = [
    ['e^{-i\\pi/3}', '6', '2\\pm i', '\\text{Médiatrice}', '3\\pi/4'],
    ['0', '\\text{Convergente}', '6', '\\text{Divergente}', '1/2'],
    [']2, +\\infty[', '2x/(x^2+1)', '0', '2\\ln 2', '(Ox)'],
    ['\\vec{n}(2,-1,3)', '1', '\\text{Colinéaires}', '\\text{Perpendiculaires}', '\\text{Vrai}']
  ]
  return <QCM_Corr subject={1} data={data[exo - 1]} />
}

function Q2_Corr({ exo }) {
  const data = [
    ['1', '5', '12', 'x \\equiv 2', '0'],
    ['0{,}12', '2', '0{,}5', 'P(A \\cap B)', '1'],
    ['(\\bar{x}, \\bar{y})', '\\text{Excellent}', 'G', '\\text{Positif}', '[-1, 1]'],
    ['0', '3e^{3x}', '0', 'e^a \\cdot e^b', '\\text{Décroissante}']
  ]
  return <QCM_Corr subject={2} data={data[exo - 1]} />
}

function Q3_Corr({ exo }) {
  const data = [
    ['\\ln x', '0{,}5', '\\int_a^b f', '\\frac{1}{b-a}\\int f', '0'],
    ['1', '5', '\\pi/2', '1-2i', '\\text{Réel}'],
    ['\\text{Croissante}', 'n(n+1)/2', '0', '\\text{Faux}', '29'],
    ['\\text{Asympt. Vert.}', '\\text{Croissante}', '\\text{Signe change}', '(Oy)', '2']
  ]
  return <QCM_Corr subject={3} data={data[exo - 1]} />
}

function Q4_Corr({ exo }) {
  const data = [
    ['0', '2', '0', '\\frac{z_A+z_B+z_C}{3}', '\\text{Cercle}'],
    ['2', '1 \\text{ ou } p-1', 'x \\equiv 2', '1', '\\text{Vrai}'],
    ['44', '0{,}2', 'np', '4V(X)', '1'],
    ['1', '0', '\\frac{x}{1+x}-\\ln(1+x)', 'x^x(1+\\ln x)', '\\text{Tangente}']
  ]
  return <QCM_Corr subject={4} data={data[exo - 1]} />
}

function Q5_Corr({ exo }) {
  const data = [
    ['\\frac{1}{2}(3I-A)', '8\\det(A)', '\\text{Unique}', '\\text{Rotation}', 'n'],
    ['1{,}6', '1{,}4', '1{,}6', '\\text{Satisfaisant}', '\\text{Nulle}'],
    ['0{,}5', '\\ln(\\ln x)', '0', '\\sqrt{2} \\text{ et } -\\sqrt{2}', '\\ln 2'],
    ['\\text{Cercle privé}', '\\text{Axe } (Ox)', 'e^{i\\alpha}', '\\text{Axe } (Ox)', 'z\'=iz']
  ]
  return <QCM_Corr subject={5} data={data[exo - 1]} />
}

function Q6_Corr({ exo }) {
  const data = [
    ['\\sqrt{2}', '\\text{Perpendiculaires}', '\\text{Sécantes}', '(1, 2, 2)', '\\pi/2'],
    ['\\frac{e^\\pi+1}{2}', '0', '0{,}5', '1-\\ln(\\frac{1+e}{2})', '1'],
    ['\\text{Croissante}', '\\ell^2-\\ell-2=0', '2', '\\text{Ni l\'un ni l\'autre}', 'a+b'],
    ['0{,}6', '1/3', '0{,}1', '1/10', '1']
  ]
  return <QCM_Corr subject={6} data={data[exo - 1]} />
}

function Q7_Corr({ exo }) {
  const data = [
    ['\\frac{z-i}{z+1} \\in \\mathbb{R}', '\\text{Cercle de diamètre } [AB]', '6k+3', '\\text{Un cercle}', 'y=-x'],
    ['0{,}12', '\\binom{10}{2}(0{,}05)^2(0{,}95)^8', '\\text{Bayes}', '0{,}7', 'P(A)+P(B)-P(A)P(B)'],
    ['0', '1', '\\ln 2', '2', '\\text{Un point d\'inflexion}'],
    ['\\frac{1}{3}|u_n-\\ell|', '\\text{La distance } |u_n-\\ell| \\to 0', '\\text{Géométrique}', '\\text{Dérivable}', '\\text{Faux}']
  ]
  return <QCM_Corr subject={7} data={data[exo - 1]} />
}

function Q8_Corr({ exo }) {
  const data = [
    ['1/8', '0{,}5', '6', 'e^{-1}', '0'],
    ['2|\\cos(\\theta/2)|', '0', '\\frac{z_C-z_A}{z_B-z_A} \\in \\mathbb{R}', '-2z', '-\\text{arg}(z)'],
    ['+\\infty', '\\ln x', ']-\\infty, 0]', '2', 'y=x'],
    ['\\text{Positif}', '\\text{Décroissante}', '0', '(n+1)I_n - 1/e', '1-1/e']
  ]
  return <QCM_Corr subject={8} data={data[exo - 1]} />
}

const DB = {
  'T1-E1': { title:'Nombres Complexes', badge:'Sujet 1 · Ex.1', C:<T1E1/> },
  'T1-E2': { title:'Géométrie dans l\'Espace', badge:'Sujet 1 · Ex.2', C:<T1E2/> },
  'T1-E3': { title:'Suites Numériques', badge:'Sujet 1 · Ex.3', C:<T1E3/> },
  'T1-E4': { title:'Analyse', badge:'Sujet 1 · Ex.4', C:<T1E4/> },
  'T2-E1': { title:'Probabilités',             badge:'Sujet 2 · Ex.1 · Probabilités',   C:<T2E1/> },
  'T2-E2': { title:'Nombres Complexes',        badge:'Sujet 2 · Ex.2 · Complexes',      C:<T2E2/> },
  'T2-E3': { title:'Géométrie dans l\'Espace', badge:'Sujet 2 · Ex.3 · Géométrie',      C:<T2E3/> },
  'T2-E4': { title:'Analyse : Suite et Problème', badge:'Sujet 2 · Ex.4 · Analyse',       C:<T2E4/> },
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

  // Sujet 11 et 12
  'T11-E1': { title:'Nombres Complexes', badge:'Sujet 11 · Ex.1', C:<T11E1/> },
  'T11-E2': { title:'Géométrie dans l\'Espace', badge:'Sujet 11 · Ex.2', C:<T11E2/> },
  'T11-E3': { title:'Calcul Intégral', badge:'Sujet 11 · Ex.3', C:<T11E3/> },
  'T11-E4': { title:'Analyse — Problème', badge:'Sujet 11 · Ex.4', C:<T11E4/> },

  'T12-E1': { title:'Nombres Complexes', badge:'Sujet 12 · Ex.1', C:<T12E1/> },
  'T12-E2': { title:'Géométrie dans l\'Espace', badge:'Sujet 12 · Ex.2', C:<T12E2/> },
  'T12-E3': { title:'Statistiques', badge:'Sujet 12 · Ex.3', C:<T12E3/> },
  'T12-E4': { title:'Analyse — Problème', badge:'Sujet 12 · Ex.4', C:<T12E4/> },

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

  'Q1-E1': { title:'Nombres Complexes', badge:'Sujet QCM 1 · Ex.1', C:<Q1_Corr exo={1}/> },
  'Q1-E2': { title:'Suites Réelles', badge:'Sujet QCM 1 · Ex.2', C:<Q1_Corr exo={2}/> },
  'Q1-E3': { title:'Analyse (Logarithmes)', badge:'Sujet QCM 1 · Ex.3', C:<Q1_Corr exo={3}/> },
  'Q1-E4': { title:'Géométrie dans l\'Espace', badge:'Sujet QCM 1 · Ex.4', C:<Q1_Corr exo={4}/> },

  'Q2-E1': { title:'Arithmétique', badge:'Sujet QCM 2 · Ex.1', C:<Q2_Corr exo={1}/> },
  'Q2-E2': { title:'Probabilités', badge:'Sujet QCM 2 · Ex.2', C:<Q2_Corr exo={2}/> },
  'Q2-E3': { title:'Statistiques', badge:'Sujet QCM 2 · Ex.3', C:<Q2_Corr exo={3}/> },
  'Q2-E4': { title:'Analyse (Exponentielles)', badge:'Sujet QCM 2 · Ex.4', C:<Q2_Corr exo={4}/> },

  'Q3-E1': { title:'Calcul Intégral', badge:'Sujet QCM 3 · Ex.1', C:<Q3_Corr exo={1}/> },
  'Q3-E2': { title:'Nombres Complexes', badge:'Sujet QCM 3 · Ex.2', C:<Q3_Corr exo={2}/> },
  'Q3-E3': { title:'Suites Réelles', badge:'Sujet QCM 3 · Ex.3', C:<Q3_Corr exo={3}/> },
  'Q3-E4': { title:'Analyse Graphique', badge:'Sujet QCM 3 · Ex.4', C:<Q3_Corr exo={4}/> },

  'Q4-E1': { title:'Nombres Complexes', badge:'Sujet QCM 4 · Ex.1', C:<Q4_Corr exo={1}/> },
  'Q4-E2': { title:'Arithmétique', badge:'Sujet QCM 4 · Ex.2', C:<Q4_Corr exo={2}/> },
  'Q4-E3': { title:'Probabilités', badge:'Sujet QCM 4 · Ex.3', C:<Q4_Corr exo={3}/> },
  'Q4-E4': { title:'Analyse (Limites)', badge:'Sujet QCM 4 · Ex.4', C:<Q4_Corr exo={4}/> },

  'Q5-E1': { title:'Matrices', badge:'Sujet QCM 5 · Ex.1', C:<Q5_Corr exo={1}/> },
  'Q5-E2': { title:'Statistiques', badge:'Sujet QCM 5 · Ex.2', C:<Q5_Corr exo={2}/> },
  'Q5-E3': { title:'Analyse (Log/Int)', badge:'Sujet QCM 5 · Ex.3', C:<Q5_Corr exo={3}/> },
  'Q5-E4': { title:'Complexes (Géométrie)', badge:'Sujet QCM 5 · Ex.4', C:<Q5_Corr exo={4}/> },

  'Q6-E1': { title:'Géométrie dans l\'Espace', badge:'Sujet QCM 6 · Ex.1', C:<Q6_Corr exo={1}/> },
  'Q6-E2': { title:'Calcul Intégral', badge:'Sujet QCM 6 · Ex.2', C:<Q6_Corr exo={2}/> },
  'Q6-E3': { title:'Suites et Limites', badge:'Sujet QCM 6 · Ex.3', C:<Q6_Corr exo={3}/> },
  'Q6-E4': { title:'Probabilités (Bayes)', badge:'Sujet QCM 6 · Ex.4', C:<Q6_Corr exo={4}/> },

  'Q7-E1': { title:'Géométrie Complexe', badge:'Sujet QCM 7 · Ex.1', C:<Q7_Corr exo={1}/> },
  'Q7-E2': { title:'Bayes et Binomiale', badge:'Sujet QCM 7 · Ex.2', C:<Q7_Corr exo={2}/> },
  'Q7-E3': { title:'Analyse Graphique', badge:'Sujet QCM 7 · Ex.3', C:<Q7_Corr exo={3}/> },
  'Q7-E4': { title:'Suites et TAF', badge:'Sujet QCM 7 · Ex.4', C:<Q7_Corr exo={4}/> },

  'Q8-E1': { title:'Lois Continues', badge:'Sujet QCM 8 · Ex.1', C:<Q8_Corr exo={1}/> },
  'Q8-E2': { title:'Complexes Avancés', badge:'Sujet QCM 8 · Ex.2', C:<Q8_Corr exo={2}/> },
  'Q8-E3': { title:'Analyse (Exp/Ln)', badge:'Sujet QCM 8 · Ex.3', C:<Q8_Corr exo={3}/> },
  'Q8-E4': { title:'Suites et Intégrales', badge:'Sujet QCM 8 · Ex.4', C:<Q8_Corr exo={4}/> }
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
  // Corrigé Révision Premium BAC: corrige_revision_1.pdf, corrige_revision_2.pdf, ...
  const revNum = (id) => { const m = id.match(/^T(\d+)/); return m ? parseInt(m[1]) : null }
  const REV_PDF_COUNT = 4  // Nombre de PDFs disponibles (mettre à jour quand de nouveaux corrigés sont ajoutés)
  const hasRevPdf = (id) => { const n = revNum(id); return n && n >= 1 && n <= REV_PDF_COUNT }
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
