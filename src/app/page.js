'use client'
import { useState, useEffect, useCallback } from 'react'

const SUPABASE_URL = 'https://gpveyzkjurmzcowpwemm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdmV5emtqdXJtemNvd3B3ZW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE5MTQsImV4cCI6MjA5NTEyNzkxNH0.Xtyg0ztnJya_TaAMV49sU47E0uQeFcizLdhDKZi2wD0'

const G = {
  bg: '#f0faf0', border: '#d4e8d0', green: '#1a6b3c',
  greenLight: '#e8f5e9', greenMid: '#4caf50',
  text: '#1a2e1a', textMid: '#4a6741', textLight: '#8aaa85',
  red: '#e53935', orange: '#f57c00', blue: '#1565c0', purple: '#6a1b9a',
}

const DAYS = ['L','M','M','G','V','S','D']

const RUOLI = [
  { key:'elite',    label:'Élite Coach',       counted:false, color:'#1a6b3c' },
  { key:'head',     label:'Head Coach',         counted:true,  color:'#1a6b3c' },
  { key:'coach',    label:'Coach',              counted:true,  color:'#1a6b3c' },
  { key:'asst',     label:'Assistant Coach',    counted:true,  color:'#2e7d32' },
  { key:'tiro',     label:'Tirocinante',        counted:true,  color:'#388e3c' },
  { key:'physical', label:'Physical Trainer',   counted:false, color:'#f57c00' },
  { key:'travel',   label:'Travelling Coach',   counted:false, color:'#1565c0' },
  { key:'video',    label:'Video/Fisio/Mental', counted:false, color:'#6a1b9a' },
  { key:'extra',    label:'Extra Program',      counted:false, color:'#6a1b9a' },
]

const IMPEGNI = [
  { key:'torneo',  label:'🏆 Torneo',      color:'#e53935' },
  { key:'stage',   label:'🎾 Stage',        color:'#1565c0' },
  { key:'fisio',   label:'🏥 Fisioterapia', color:'#f57c00' },
  { key:'off',     label:'🏖️ Off',          color:'#6a1b9a' },
  { key:'altro',   label:'📌 Altro',        color:'#4a6741' },
]

const SECTIONS = [
  { id:'s0',  name:'Stage Elba' },
  { id:'s1',  name:'Gennaio' },  { id:'s2',  name:'Febbraio' },
  { id:'s3',  name:'Marzo' },    { id:'s4',  name:'Aprile' },
  { id:'s5',  name:'Maggio' },   { id:'s6',  name:'Giugno' },
  { id:'s7',  name:'Luglio' },   { id:'s8',  name:'Agosto' },
  { id:'s9',  name:'Settembre' },{ id:'s10', name:'Ottobre' },
  { id:'s11', name:'Novembre' }, { id:'s12', name:'Dicembre' },
]

function uid() { return 'id'+Math.random().toString(36).slice(2,9) }

async function sbFetch(table, params='') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}

async function sbPatch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(data)
  })
  return res.ok
}

function calcCounters(rows) {
  const centro    = DAYS.map((_,di) => rows.filter(r => ['head','coach','asst','tiro'].includes(r.ruolo) && r.giorni[di] && !r.impegno).length)
  const torneo    = DAYS.map((_,di) => rows.filter(r => r.giorni[di] && r.impegno==='torneo').length)
  const travel    = DAYS.map((_,di) => rows.filter(r => r.giorni[di] && r.ruolo==='travel').length)
  const extra     = DAYS.map((_,di) => rows.filter(r => r.giorni[di] && r.ruolo==='extra').length)
  const tiroFuori = DAYS.map((_,di) => rows.filter(r => r.giorni[di] && r.ruolo==='tiro' && r.impegno).length)
  return { centro, torneo, travel, extra, tiroFuori }
}

const STORAGE_KEY = 'ptc_planner_v3'
function loadState() {
  if (typeof window==='undefined') return null
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null') } catch { return null }
}
function saveState(data) {
  if (typeof window==='undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// ── UI primitives ─────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:28, width:480, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <span style={{ fontWeight:700, fontSize:17, color:G.text }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:G.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:G.textMid, marginBottom:6, textTransform:'uppercase', letterSpacing:.6 }}>{label}</div>
      {children}
    </div>
  )
}

function FInput({ value, onChange, placeholder, onKeyDown }) {
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${G.border}`, background:G.bg, fontSize:13, color:G.text, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
}

function FSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${G.border}`, background:G.bg, fontSize:13, color:G.text, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function DayPicker({ selected, onChange }) {
  return (
    <div style={{ display:'flex', gap:6 }}>
      {DAYS.map((d,i)=>(
        <button key={i} onClick={()=>{ const n=[...selected]; n[i]=!n[i]; onChange(n) }}
          style={{ flex:1, height:38, borderRadius:8, border:`2px solid ${selected[i]?G.green:G.border}`, background:selected[i]?G.green:'#fff', color:selected[i]?'#fff':G.textMid, fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer' }}>{d}</button>
      ))}
    </div>
  )
}

function StatBar({ label, color, values }) {
  const tot = values.reduce((a,b)=>a+b,0)
  if (tot===0) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:700, color, minWidth:100, textTransform:'uppercase', letterSpacing:.4 }}>{label}</span>
      {DAYS.map((d,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:3, background:values[i]>0?color+'18':'transparent', borderRadius:16, padding:'2px 8px', minWidth:32 }}>
          <span style={{ fontSize:9, color:G.textLight, fontWeight:600 }}>{d}</span>
          <span style={{ fontSize:12, fontWeight:800, color:values[i]>0?color:G.textLight }}>{values[i]||'—'}</span>
        </div>
      ))}
    </div>
  )
}

// ── Pagina Gestione Coach ─────────────────────────────────────────────
function CoachPage({ coaches, onUpdate }) {
  const [saving, setSaving] = useState(null)
  const [search, setSearch] = useState('')

  async function changeRuolo(coach, ruolo) {
    setSaving(coach.id)
    const ok = await sbPatch('coach', coach.id, { ruolo })
    if (ok) onUpdate(coach.id, { ...coach, ruolo })
    setSaving(null)
  }

  const filtered = coaches.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()))
  const grouped = RUOLI.reduce((acc, r) => {
    acc[r.key] = filtered.filter(c => c.ruolo === r.key)
    return acc
  }, {})

  return (
    <div style={{ padding:20, maxWidth:1000, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:G.text, margin:0 }}>Gestione Coach</h1>
          <p style={{ fontSize:13, color:G.textMid, margin:'3px 0 0' }}>{coaches.length} coach · modifica ruoli sincronizzati con Supabase</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cerca coach..."
          style={{ padding:'8px 14px', borderRadius:20, border:`1.5px solid ${G.border}`, background:'#fff', fontSize:13, outline:'none', fontFamily:'inherit', width:200 }} />
      </div>

      {/* Lista per ruolo */}
      {RUOLI.map(ruolo => {
        const list = grouped[ruolo.key] || []
        if (list.length === 0 && search) return null
        return (
          <div key={ruolo.key} style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, marginBottom:12, overflow:'hidden', boxShadow:'0 1px 4px rgba(26,107,60,0.06)' }}>
            <div style={{ background:G.greenLight, borderBottom:`1px solid ${G.border}`, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:ruolo.color+'20', color:ruolo.color }}>{ruolo.label}</span>
              <span style={{ fontSize:12, color:G.textMid }}>{list.length} coach</span>
            </div>
            {list.length === 0 ? (
              <div style={{ padding:'14px 16px', color:G.textLight, fontSize:13 }}>Nessun coach assegnato</div>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:12 }}>
                {list.map(coach => (
                  <div key={coach.id} style={{ display:'flex', alignItems:'center', gap:8, background:G.bg, borderRadius:10, padding:'8px 12px', border:`1px solid ${G.border}` }}>
                    <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{coach.nome}</span>
                    <select value={coach.ruolo||'coach'} onChange={e=>changeRuolo(coach, e.target.value)}
                      disabled={saving===coach.id}
                      style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:'3px 6px', fontSize:11, fontFamily:'inherit', background:'#fff', color:G.textMid, outline:'none', cursor:'pointer', opacity:saving===coach.id?0.5:1 }}>
                      {RUOLI.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
                    </select>
                    {saving===coach.id && <span style={{ fontSize:11, color:G.textLight }}>⟳</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Coach senza ruolo assegnato */}
      {filtered.filter(c=>!RUOLI.find(r=>r.key===c.ruolo)).length > 0 && (
        <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, marginBottom:12, overflow:'hidden' }}>
          <div style={{ background:'#fff8f0', borderBottom:`1px solid ${G.border}`, padding:'10px 16px' }}>
            <span style={{ fontSize:12, fontWeight:700, color:G.orange }}>⚠️ Ruolo non assegnato</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:12 }}>
            {filtered.filter(c=>!RUOLI.find(r=>r.key===c.ruolo)).map(coach=>(
              <div key={coach.id} style={{ display:'flex', alignItems:'center', gap:8, background:G.bg, borderRadius:10, padding:'8px 12px', border:`1px solid ${G.border}` }}>
                <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{coach.nome}</span>
                <select value={coach.ruolo||''} onChange={e=>changeRuolo(coach, e.target.value)}
                  style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:'3px 6px', fontSize:11, fontFamily:'inherit', background:'#fff', color:G.textMid, outline:'none', cursor:'pointer' }}>
                  <option value="">— seleziona —</option>
                  {RUOLI.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── WeekBlock ─────────────────────────────────────────────────────────
function WeekBlock({ week, coaches, tornei, sectionName, onUpdate, onDelete, onAddRow, onDeleteRow }) {
  const { centro, torneo, travel, extra, tiroFuori } = calcCounters(week.rows)
  const months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
  const monthIdx = months.indexOf(sectionName)
  let weekMon=null, weekSun=null
  if (monthIdx>=0) { weekMon=new Date(2026,monthIdx,week.num); weekSun=new Date(2026,monthIdx,week.num+6) }
  const torneiSett = weekMon ? tornei.filter(t=>{ const d=new Date(t.data); return d>=weekMon&&d<=weekSun }) : []

  return (
    <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, marginBottom:16, overflow:'hidden', boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
      {/* Header */}
      <div style={{ background:G.greenLight, borderBottom:`1px solid ${G.border}`, padding:'10px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{ width:46, height:46, borderRadius:10, background:G.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff', flexShrink:0 }}>{week.num}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.text }}>
              Settimana {week.num}
              {week.note&&<span style={{ fontWeight:400, color:G.textMid, marginLeft:8, fontSize:12 }}>· {week.note}</span>}
            </div>
            <div style={{ fontSize:11, color:G.textMid, marginTop:2 }}>{week.rows.length} maestri</div>
          </div>
          {/* Day badges */}
          <div style={{ display:'flex', gap:4 }}>
            {DAYS.map((d,i)=>(
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:G.textLight, fontWeight:700, marginBottom:2 }}>{d}</div>
                <div style={{ width:30, height:28, borderRadius:6, background:centro[i]>0?G.green:'#f0f4f0', color:centro[i]>0?'#fff':G.textLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>{centro[i]||'—'}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button onClick={onAddRow} style={{ background:'#fff', border:`1.5px solid ${G.green}`, color:G.green, borderRadius:8, padding:'7px 14px', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Maestro</button>
            <button onClick={onDelete} style={{ background:'#fef2f2', border:`1.5px solid #fecaca`, color:G.red, borderRadius:8, padding:'7px 10px', fontFamily:'inherit', fontSize:12, cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {/* Stat bars */}
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:5 }}>
          <StatBar label="🏆 Torneo" color={G.red} values={torneo} />
          <StatBar label="✈️ Travelling" color={G.blue} values={travel} />
          <StatBar label="📋 Extra" color={G.purple} values={extra} />
          <StatBar label="👶 Tiro fuori" color={G.orange} values={tiroFuori} />
        </div>

        {/* Tornei Supabase */}
        {torneiSett.length>0&&(
          <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
            {torneiSett.map(t=>{
              const c1=coaches.find(c=>c.id===t.coach_id)
              const c2=coaches.find(c=>c.id===t.coach_id_2)
              return (
                <div key={t.id} style={{ background:'#fff', border:`1px solid ${G.border}`, borderRadius:8, padding:'5px 10px', fontSize:11 }}>
                  <span style={{ fontWeight:700, color:G.red }}>🏆 {t.nome}</span>
                  <span style={{ color:G.textMid, marginLeft:6 }}>{t.luogo} · {new Date(t.data).toLocaleDateString('it-IT',{day:'numeric',month:'short'})}</span>
                  {(c1||c2)&&<span style={{ color:G.green, marginLeft:6, fontWeight:600 }}>· {[c1,c2].filter(Boolean).map(c=>c.nome).join(', ')}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tabella */}
      {week.rows.length===0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:G.textLight, fontSize:13 }}>Nessun maestro — clicca <strong>+ Maestro</strong></div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead>
              <tr>
                {['NOME','RUOLO','IMPEGNO',...DAYS,''].map((h,i)=>(
                  <th key={i} style={{ padding:'6px 8px', background:'#f4faf4', borderBottom:`1px solid ${G.border}`, fontSize:10, fontWeight:700, color:G.textMid, textAlign:i>2?'center':'left', whiteSpace:'nowrap', width:i>2&&i<10?34:'auto' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.rows.map((row,ri)=>{
                const ruoloInfo=RUOLI.find(r=>r.key===row.ruolo)
                const impegnoInfo=IMPEGNI.find(i=>i.key===row.impegno)
                return (
                  <tr key={row.id} style={{ background:ri%2===0?'#fff':'#fafcfa' }}>
                    <td style={{ padding:'4px 8px', borderBottom:`1px solid #f0f5f0`, fontSize:13, minWidth:120 }}>
                      <input defaultValue={row.nome} onBlur={e=>onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,nome:e.target.value}:r)})}
                        style={{ border:'none', background:'transparent', fontSize:13, color:G.text, outline:'none', fontFamily:'inherit', width:'100%' }} />
                    </td>
                    <td style={{ padding:'4px 8px', borderBottom:`1px solid #f0f5f0` }}>
                      <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:ruoloInfo?.counted?G.greenLight:'#f3f4f6', color:ruoloInfo?.counted?G.green:G.textMid }}>
                        {ruoloInfo?.label||row.ruolo}
                      </span>
                    </td>
                    <td style={{ padding:'4px 8px', borderBottom:`1px solid #f0f5f0`, minWidth:130 }}>
                      <select value={row.impegno||''} onChange={e=>onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,impegno:e.target.value}:r)})}
                        style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:'3px 6px', fontSize:11, fontFamily:'inherit', background:impegnoInfo?impegnoInfo.color+'18':'#fff', color:impegnoInfo?.color||G.textMid, fontWeight:600, outline:'none', cursor:'pointer' }}>
                        <option value="">— al centro —</option>
                        {IMPEGNI.map(imp=><option key={imp.key} value={imp.key}>{imp.label}</option>)}
                      </select>
                    </td>
                    {DAYS.map((d,di)=>(
                      <td key={di} style={{ padding:'3px', borderBottom:`1px solid #f0f5f0`, textAlign:'center' }}>
                        <button onClick={()=>{ const ng=[...row.giorni]; ng[di]=!ng[di]; onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,giorni:ng}:r)}) }}
                          style={{ width:26, height:26, borderRadius:6, border:`1.5px solid ${row.giorni[di]?G.green:G.border}`, background:row.giorni[di]?G.green:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                          {row.giorni[di]&&<span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>✓</span>}
                        </button>
                      </td>
                    ))}
                    <td style={{ textAlign:'center', borderBottom:`1px solid #f0f5f0` }}>
                      <button onClick={()=>onDeleteRow(row.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:14, padding:'2px 6px', borderRadius:4 }}
                        onMouseEnter={e=>e.target.style.color=G.red} onMouseLeave={e=>e.target.style.color='#ddd'}>✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function Home() {
  const [page, setPage] = useState('planner') // 'planner' | 'coach'
  const [sections, setSections] = useState(SECTIONS)
  const [active, setActive] = useState('s6')
  const [weeks, setWeeks] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [tornei, setTornei] = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const [flashSave, setFlashSave] = useState(false)

  // Modals
  const [modalRow, setModalRow] = useState(null)
  const [newNome, setNewNome] = useState('')
  const [newRuolo, setNewRuolo] = useState('')
  const [newGiorni, setNewGiorni] = useState([false,false,false,false,false,false,false])
  const [newImpegno, setNewImpegno] = useState('')
  const [newCoachId, setNewCoachId] = useState('')
  const [modalWeek, setModalWeek] = useState(false)
  const [newWeekNum, setNewWeekNum] = useState('')
  const [newWeekNote, setNewWeekNote] = useState('')
  const [modalSection, setModalSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')

  useEffect(()=>{
    const saved=loadState()
    if (saved) {
      if (saved.sections) setSections(saved.sections)
      if (saved.weeks) setWeeks(saved.weeks)
    } else {
      const empty={}; SECTIONS.forEach(s=>{empty[s.id]=[]}); setWeeks(empty)
    }
    setLoaded(true)
  },[])

  useEffect(()=>{ if(!loaded) return; saveState({sections,weeks}) },[sections,weeks,loaded])

  const loadSupabase = useCallback(async()=>{
    setSyncStatus('loading')
    try {
      const [c,t] = await Promise.all([
        sbFetch('coach','select=*&order=nome'),
        sbFetch('tornei','select=*&order=data'),
      ])
      setCoaches(c); setTornei(t); setSyncStatus('ok')
    } catch(e) { console.error(e); setSyncStatus('error') }
  },[])

  useEffect(()=>{ loadSupabase() },[loadSupabase])
  useEffect(()=>{ const iv=setInterval(loadSupabase,30000); return()=>clearInterval(iv) },[loadSupabase])

  function updateCoach(id, updated) {
    setCoaches(prev=>prev.map(c=>c.id===id?updated:c))
  }

  const wks=weeks[active]||[]
  const activeSection=sections.find(s=>s.id===active)
  const totalCentro=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).centro[di],0))
  const totalTorneo=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).torneo[di],0))
  const totalTravel=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).travel[di],0))
  const totalExtra =DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).extra[di],0))

  function setActiveWeeks(fn) { setWeeks(prev=>({...prev,[active]:typeof fn==='function'?fn(prev[active]||[]):fn})) }
  function updateWeek(updated) { setActiveWeeks(ws=>ws.map(w=>w.id===updated.id?updated:w)) }
  function deleteWeek(id) { setActiveWeeks(ws=>ws.filter(w=>w.id!==id)) }
  function deleteRow(weekId,rowId) { setActiveWeeks(ws=>ws.map(w=>w.id===weekId?{...w,rows:w.rows.filter(r=>r.id!==rowId)}:w)) }

  function openAddRow(weekId) { setModalRow(weekId); setNewNome(''); setNewRuolo(''); setNewImpegno(''); setNewCoachId(''); setNewGiorni([false,false,false,false,false,false,false]) }

  function confirmAddRow() {
    if (!newRuolo) return
    const coachSupa=coaches.find(c=>String(c.id)===newCoachId)
    const nome=coachSupa?coachSupa.nome:newNome.trim()
    const ruolo=coachSupa&&coachSupa.ruolo&&newRuolo==='coach'?(coachSupa.ruolo):newRuolo
    if (!nome) return
    const row={id:uid(),nome,ruolo,giorni:newGiorni,impegno:newImpegno,coachId:newCoachId||null}
    setActiveWeeks(ws=>ws.map(w=>w.id===modalRow?{...w,rows:[...w.rows,row]}:w))
    setModalRow(null); doFlash()
  }

  function confirmAddWeek() {
    const num=parseInt(newWeekNum)||((wks.slice(-1)[0]?.num||0)+7)
    setActiveWeeks(ws=>[...ws,{id:uid(),num,note:newWeekNote.trim(),rows:[]}])
    setModalWeek(false); setNewWeekNum(''); setNewWeekNote(''); doFlash()
  }

  function confirmAddSection() {
    if (!newSectionName.trim()) return
    const id='sx_'+uid()
    setSections(prev=>[...prev,{id,name:newSectionName.trim()}])
    setWeeks(prev=>({...prev,[id]:[]}))
    setActive(id); setModalSection(false); setNewSectionName(''); doFlash()
  }

  function doFlash() { setFlashSave(true); setTimeout(()=>setFlashSave(false),2000) }

  return (
    <div style={{ minHeight:'100vh', background:G.bg }}>

      {/* NAVBAR */}
      <nav style={{ background:'#fff', borderBottom:`1px solid ${G.border}`, padding:'0 16px', height:58, display:'flex', alignItems:'center', gap:10, position:'sticky', top:0, zIndex:200, boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${G.green},${G.greenMid})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>🎾</div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:G.green, letterSpacing:.5, lineHeight:1.1 }}>PIATTI TENNIS CENTER</div>
            <div style={{ fontSize:9, fontWeight:600, color:G.greenMid, letterSpacing:1 }}>PLANNER MAESTRI</div>
          </div>
        </div>

        {/* Nav pages */}
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          <button onClick={()=>setPage('planner')} style={{ background:page==='planner'?G.green:'transparent', color:page==='planner'?'#fff':G.textMid, border:page==='planner'?'none':`1.5px solid ${G.border}`, borderRadius:20, padding:'5px 14px', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer' }}>📋 Planner</button>
          <button onClick={()=>setPage('coach')} style={{ background:page==='coach'?G.green:'transparent', color:page==='coach'?'#fff':G.textMid, border:page==='coach'?'none':`1.5px solid ${G.border}`, borderRadius:20, padding:'5px 14px', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer' }}>👤 Coach</button>
        </div>

        {/* Mesi tabs - solo in planner */}
        {page==='planner'&&(
          <div style={{ flex:1, display:'flex', gap:3, overflowX:'auto', scrollbarWidth:'none', padding:'3px 0' }}>
            {sections.map(s=>(
              <button key={s.id} onClick={()=>setActive(s.id)} style={{ background:s.id===active?G.green:'transparent', color:s.id===active?'#fff':G.textMid, border:s.id===active?'none':`1.5px solid ${G.border}`, borderRadius:20, padding:'4px 12px', fontFamily:'inherit', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>{s.name}</button>
            ))}
            <button onClick={()=>setModalSection(true)} style={{ background:'transparent', color:G.textLight, border:`1.5px dashed ${G.border}`, borderRadius:20, padding:'4px 10px', fontFamily:'inherit', fontSize:11, cursor:'pointer', flexShrink:0 }}>+</button>
          </div>
        )}

        {/* Sync status */}
        <div style={{ fontSize:11, fontWeight:600, flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
          {syncStatus==='loading'&&<span style={{ color:G.textLight }}>⟳</span>}
          {syncStatus==='ok'&&<span style={{ color:G.green, fontSize:10 }}>🔗 {coaches.length} coach</span>}
          {syncStatus==='error'&&<button onClick={loadSupabase} style={{ color:G.red, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11 }}>⚠️ Retry</button>}
          <span style={{ color:flashSave?G.green:G.textLight, transition:'color .3s' }}>{flashSave?'✅':'💾'}</span>
        </div>
      </nav>

      {/* PAGE: Coach */}
      {page==='coach'&&<CoachPage coaches={coaches} onUpdate={updateCoach} />}

      {/* PAGE: Planner */}
      {page==='planner'&&(
        <div style={{ padding:20, maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:G.text, margin:0 }}>{activeSection?.name} 2026</h1>
              <p style={{ fontSize:13, color:G.textMid, margin:'3px 0 0' }}>{wks.length} settimane · {wks.reduce((s,w)=>s+w.rows.length,0)} maestri</p>
            </div>
            <button onClick={()=>setModalWeek(true)} style={{ background:G.green, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Settimana</button>
          </div>

          {/* Totals */}
          <div style={{ background:'#fff', border:`1px solid ${G.border}`, borderRadius:10, padding:'14px 16px', marginBottom:16, boxShadow:'0 1px 4px rgba(26,107,60,0.05)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <StatBar label="🏠 Al centro" color={G.green} values={totalCentro} />
              <StatBar label="🏆 Torneo" color={G.red} values={totalTorneo} />
              <StatBar label="✈️ Travelling" color={G.blue} values={totalTravel} />
              <StatBar label="📋 Extra" color={G.purple} values={totalExtra} />
            </div>
          </div>

          {wks.length===0&&(
            <div style={{ textAlign:'center', padding:'60px 0', color:G.textLight }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:16, fontWeight:600 }}>Nessuna settimana</div>
              <div style={{ fontSize:13, marginTop:4 }}>Clicca &ldquo;+ Settimana&rdquo; per iniziare</div>
            </div>
          )}

          {wks.map(week=>(
            <WeekBlock key={week.id} week={week} coaches={coaches} tornei={tornei}
              sectionName={activeSection?.name||''}
              onUpdate={updateWeek}
              onDelete={()=>deleteWeek(week.id)}
              onAddRow={()=>openAddRow(week.id)}
              onDeleteRow={rowId=>deleteRow(week.id,rowId)}
            />
          ))}
        </div>
      )}

      {/* MODAL: Aggiungi Maestro */}
      <Modal open={!!modalRow} onClose={()=>setModalRow(null)} title="Aggiungi Maestro">
        <Field label="Scegli da lista coach Supabase">
          <FSelect value={newCoachId} onChange={v=>{ setNewCoachId(v); const c=coaches.find(c=>String(c.id)===v); if(c){setNewNome(c.nome); if(c.ruolo&&RUOLI.find(r=>r.key===c.ruolo))setNewRuolo(c.ruolo)} }} options={[
            {value:'',label:'— seleziona coach —'},
            ...coaches.map(c=>({value:String(c.id),label:`${c.nome}${c.ruolo&&c.ruolo!=='coach'?' ('+RUOLI.find(r=>r.key===c.ruolo)?.label+')':''}`}))
          ]} />
        </Field>
        <Field label="oppure inserisci nome manualmente">
          <FInput value={newNome} onChange={setNewNome} placeholder="Nome maestro" />
        </Field>
        <Field label="Ruolo">
          <FSelect value={newRuolo} onChange={setNewRuolo} options={[
            {value:'',label:'— seleziona ruolo —'},
            ...RUOLI.map(r=>({value:r.key,label:r.label}))
          ]} />
        </Field>
        <Field label="Impegno fuori centro">
          <FSelect value={newImpegno} onChange={setNewImpegno} options={[
            {value:'',label:'— al centro —'},
            ...IMPEGNI.map(i=>({value:i.key,label:i.label}))
          ]} />
        </Field>
        <Field label="Giorni presenti">
          <DayPicker selected={newGiorni} onChange={setNewGiorni} />
        </Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
          <button onClick={()=>setModalRow(null)} style={{ background:'transparent', color:G.textMid, border:`1.5px solid ${G.border}`, padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>Annulla</button>
          <button onClick={confirmAddRow} disabled={!newRuolo||(!newNome.trim()&&!newCoachId)} style={{ background:(newRuolo&&(newNome.trim()||newCoachId))?G.green:'#ccc', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>Aggiungi</button>
        </div>
      </Modal>

      {/* MODAL: Nuova Settimana */}
      <Modal open={modalWeek} onClose={()=>setModalWeek(false)} title="Nuova Settimana">
        <Field label="Giorno iniziale del mese (es. 1, 8, 15, 22, 29)">
          <FInput value={newWeekNum} onChange={setNewWeekNum} placeholder={String((wks.slice(-1)[0]?.num||0)+7)} onKeyDown={e=>e.key==='Enter'&&confirmAddWeek()} />
        </Field>
        <Field label="Nota (opzionale)">
          <FInput value={newWeekNote} onChange={setNewWeekNote} placeholder="es. Stage, Monte Carlo…" />
        </Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={()=>setModalWeek(false)} style={{ background:'transparent', color:G.textMid, border:`1.5px solid ${G.border}`, padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>Annulla</button>
          <button onClick={confirmAddWeek} style={{ background:G.green, color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>Crea</button>
        </div>
      </Modal>

      {/* MODAL: Nuova Sezione */}
      <Modal open={modalSection} onClose={()=>setModalSection(false)} title="Nuova Sezione">
        <Field label="Nome sezione">
          <FInput value={newSectionName} onChange={setNewSectionName} placeholder="es. Stage Invernale" onKeyDown={e=>e.key==='Enter'&&confirmAddSection()} />
        </Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={()=>setModalSection(false)} style={{ background:'transparent', color:G.textMid, border:`1.5px solid ${G.border}`, padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>Annulla</button>
          <button onClick={confirmAddSection} style={{ background:G.green, color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>Crea</button>
        </div>
      </Modal>
    </div>
  )
}
