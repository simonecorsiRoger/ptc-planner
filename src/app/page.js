'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const SUPABASE_URL = 'https://gpveyzkjurmzcowpwemm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdmV5emtqdXJtemNvd3B3ZW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE5MTQsImV4cCI6MjA5NTEyNzkxNH0.Xtyg0ztnJya_TaAMV49sU47E0uQeFcizLdhDKZi2wD0'
const TORNEI_URL = 'https://tennis-tornei.vercel.app'
const ADMIN_PASSWORD = 'tennis2026'

const G = {
  bg:'#f0faf0', border:'#d4e8d0', green:'#1a6b3c',
  greenLight:'#e8f5e9', greenMid:'#4caf50',
  text:'#1a2e1a', textMid:'#4a6741', textLight:'#8aaa85',
  red:'#e53935', orange:'#f57c00', blue:'#1565c0', purple:'#6a1b9a',
}

const DAYS = ['L','M','M','G','V','S','D']
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

const RUOLI = [
  { key:'elite',    label:'Élite Coach',       counted:true,  color:'#1a6b3c', order:0 },
  { key:'head',     label:'Head Coach',         counted:true,  color:'#1565c0', order:1 },
  { key:'coach',    label:'Coach',              counted:true,  color:'#1a6b3c', order:2 },
  { key:'asst',     label:'Assistant Coach',    counted:true,  color:'#2e7d32', order:3 },
  { key:'tiro',     label:'Tirocinante',        counted:true,  color:'#388e3c', order:4 },
  { key:'physical', label:'Physical Trainer',   counted:true,  color:'#f57c00', order:5 },
  { key:'travel',   label:'Travelling Coach',   counted:false, color:'#795548', order:6 },
  { key:'video',    label:'Video/Fisio/Mental', counted:false, color:'#6a1b9a', order:7 },
  { key:'extra',    label:'Extra Program',      counted:false, color:'#9e9e9e', order:8 },
]

const IMPEGNI = [
  { key:'torneo', label:'🏆 Torneo',      color:'#e53935' },
  { key:'stage',  label:'🎾 Stage',        color:'#1565c0' },
  { key:'fisio',  label:'🏥 Fisioterapia', color:'#f57c00' },
  { key:'off',    label:'🏖️ Off',          color:'#6a1b9a' },
  { key:'altro',  label:'📌 Altro',        color:'#4a6741' },
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

const ROLE_ORDER = ['elite','head','coach','asst','tiro','physical','travel','video','extra']

function uid() { return 'id'+Math.random().toString(36).slice(2,9) }

function sortRows(rows) {
  return [...rows].sort((a,b)=>{
    const ai=ROLE_ORDER.indexOf(a.ruolo), bi=ROLE_ORDER.indexOf(b.ruolo)
    if((ai===-1?99:ai)!==(bi===-1?99:bi)) return (ai===-1?99:ai)-(bi===-1?99:bi)
    return a.nome.localeCompare(b.nome)
  })
}

// ── Supabase helpers ──────────────────────────────────────────────────
const SB = {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  },

  async get(table, params='') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: this.headers })
    if (!r.ok) throw new Error(`GET ${table} ${r.status}`)
    return r.json()
  },

  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:'POST', headers:{...this.headers, Prefer:'return=representation'}, body:JSON.stringify(data)
    })
    if (!r.ok) throw new Error(`INSERT ${table} ${r.status}: ${await r.text()}`)
    return r.json()
  },

  async update(table, filter, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method:'PATCH', headers:{...this.headers, Prefer:'return=minimal'}, body:JSON.stringify(data)
    })
    return r.ok
  },

  async delete(table, filter) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method:'DELETE', headers: this.headers
    })
    return r.ok
  },

  async upsert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:'POST', headers:{...this.headers, Prefer:'return=representation,resolution=merge-duplicates'}, body:JSON.stringify(data)
    })
    if (!r.ok) throw new Error(`UPSERT ${table} ${r.status}: ${await r.text()}`)
    return r.json()
  }
}

// ── DB: carica settimane da Supabase ─────────────────────────────────
async function dbLoadWeeks() {
  const [settimane, maestri] = await Promise.all([
    SB.get('planner_settimane', 'select=*&order=num'),
    SB.get('planner_maestri', 'select=*'),
  ])
  // Raggruppa per sezione
  const result = {}
  SECTIONS.forEach(s => { result[s.id] = [] })
  settimane.forEach(s => {
    if (!result[s.sezione]) result[s.sezione] = []
    const rows = maestri
      .filter(m => m.settimana_id === s.id)
      .map(m => ({
        id: m.id,
        nome: m.nome,
        ruolo: m.ruolo,
        impegno: m.impegno || '',
        giorni: Array.isArray(m.giorni) ? m.giorni : JSON.parse(m.giorni || '[false,false,false,false,false,false,false]'),
        coachId: m.coach_ref_id ? String(m.coach_ref_id) : null,
      }))
    result[s.sezione].push({
      id: s.id,
      num: s.num,
      note: s.note || '',
      rows,
    })
  })
  return result
}

// ── DB: salva settimana ───────────────────────────────────────────────
async function dbSaveWeek(sezione, week) {
  await SB.upsert('planner_settimane', { id: week.id, sezione, num: week.num, note: week.note || '', anno: 2026 })
}

// ── DB: salva riga maestro ────────────────────────────────────────────
async function dbSaveRow(settimana_id, row) {
  await SB.upsert('planner_maestri', {
    id: row.id,
    settimana_id,
    nome: row.nome,
    ruolo: row.ruolo,
    impegno: row.impegno || '',
    giorni: JSON.stringify(row.giorni),
    coach_ref_id: row.coachId ? parseInt(row.coachId) : null,
  })
}

// ── DB: elimina settimana ─────────────────────────────────────────────
async function dbDeleteWeek(weekId) {
  await SB.delete('planner_maestri', `settimana_id=eq.${weekId}`)
  await SB.delete('planner_settimane', `id=eq.${weekId}`)
}

// ── DB: elimina riga ──────────────────────────────────────────────────
async function dbDeleteRow(rowId) {
  await SB.delete('planner_maestri', `id=eq.${rowId}`)
}

// ── calcCounters ──────────────────────────────────────────────────────
function calcCounters(rows) {
  const centro    = DAYS.map((_,di)=>rows.filter(r=>['elite','head','coach','asst','tiro','physical'].includes(r.ruolo)&&r.giorni[di]&&!r.impegno).length)
  const torneo    = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.impegno==='torneo').length)
  const travel    = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='travel').length)
  const extra     = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='extra').length)
  const tiroFuori = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='tiro'&&r.impegno).length)
  const byRole = {}
  ROLE_ORDER.forEach(rk => { byRole[rk] = DAYS.map((_,di)=>rows.filter(r=>r.ruolo===rk&&r.giorni[di]&&!r.impegno).length) })
  return { centro, torneo, travel, extra, tiroFuori, byRole }
}

// ── UI ────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:24, width:460, maxWidth:'100%', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontWeight:700, fontSize:16, color:G.text }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:G.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:700, color:G.textMid, marginBottom:5, textTransform:'uppercase', letterSpacing:.6 }}>{label}</div>
      {children}
    </div>
  )
}
function FInput({ value, onChange, placeholder, onKeyDown, type='text' }) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
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
    <div style={{ display:'flex', gap:5 }}>
      {DAYS.map((d,i)=>(
        <button key={i} onClick={()=>{ const n=[...selected]; n[i]=!n[i]; onChange(n) }}
          style={{ flex:1, height:40, borderRadius:8, border:`2px solid ${selected[i]?G.green:G.border}`, background:selected[i]?G.green:'#fff', color:selected[i]?'#fff':G.textMid, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>{d}</button>
      ))}
    </div>
  )
}
function StatBar({ label, color, values }) {
  const tot = values.reduce((a,b)=>a+b,0)
  if (tot===0) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:700, color, minWidth:95, textTransform:'uppercase', letterSpacing:.4 }}>{label}</span>
      {DAYS.map((d,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:3, background:values[i]>0?color+'18':'transparent', borderRadius:16, padding:'2px 7px', minWidth:30 }}>
          <span style={{ fontSize:9, color:G.textLight, fontWeight:600 }}>{d}</span>
          <span style={{ fontSize:12, fontWeight:800, color:values[i]>0?color:G.textLight }}>{values[i]||'—'}</span>
        </div>
      ))}
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [show, setShow] = useState(false)
  function tryLogin() {
    if (pw===ADMIN_PASSWORD) { onLogin(); setError(false) }
    else { setError(true); setPw('') }
  }
  return (
    <div style={{ minHeight:'100vh', background:G.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:36, width:360, maxWidth:'100%', boxShadow:'0 8px 40px rgba(26,107,60,0.12)', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg,${G.green},${G.greenMid})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 20px' }}>🎾</div>
        <div style={{ fontSize:18, fontWeight:800, color:G.green, marginBottom:4 }}>PIATTI TENNIS CENTER</div>
        <div style={{ fontSize:12, fontWeight:600, color:G.textMid, letterSpacing:1, marginBottom:28 }}>PLANNER MAESTRI</div>
        <div style={{ position:'relative', marginBottom:12 }}>
          <input type={show?'text':'password'} value={pw}
            onChange={e=>{ setPw(e.target.value); setError(false) }}
            onKeyDown={e=>e.key==='Enter'&&tryLogin()}
            placeholder="Password admin"
            style={{ width:'100%', padding:'12px 44px 12px 16px', borderRadius:10, border:`2px solid ${error?G.red:G.border}`, background:G.bg, fontSize:15, color:G.text, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
          <button onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:G.textLight }}>{show?'🙈':'👁️'}</button>
        </div>
        {error&&<div style={{ color:G.red, fontSize:12, marginBottom:10, fontWeight:600 }}>Password errata.</div>}
        <button onClick={tryLogin} style={{ width:'100%', background:G.green, color:'#fff', border:'none', borderRadius:10, padding:'13px', fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer' }}>Accedi</button>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────
function DashboardPage({ weeks, coaches }) {
  const [selCoach, setSelCoach] = useState('')
  function getCoachStats(nome) {
    const byMonth={}; let tc=0,tt=0,ts=0,te=0,to=0,tg=0
    MONTHS.forEach(m=>{
      const sid=SECTIONS.find(s=>s.name===m)?.id; const wks=weeks[sid]||[]
      let mc=0,mt=0,ms=0,me=0,mo=0,mg=0
      wks.forEach(w=>{
        const row=w.rows.find(r=>r.nome===nome); if(!row) return
        const g=row.giorni.filter(Boolean).length; mg+=g; tg+=g
        if(!row.impegno){mc++;tc++} else if(row.impegno==='torneo'){mt++;tt++}
        else if(row.impegno==='stage'){ms++;ts++} else if(row.ruolo==='extra'){me++;te++}
        else if(row.impegno==='off'){mo++;to++}
      })
      byMonth[m]={centro:mc,torneo:mt,stage:ms,extra:me,off:mo,giorni:mg}
    })
    return{byMonth,tc,tt,ts,te,to,tg}
  }
  const allNames=[...new Set(Object.values(weeks).flatMap(wks=>wks.flatMap(w=>w.rows.map(r=>r.nome))))].sort()
  const stats=selCoach?getCoachStats(selCoach):null
  const globalByMonth=MONTHS.map(m=>{
    const sid=SECTIONS.find(s=>s.name===m)?.id; const wks=weeks[sid]||[]
    const allRows=wks.flatMap(w=>w.rows)
    const centro=DAYS.map((_,di)=>allRows.filter(r=>['elite','head','coach','asst','tiro','physical'].includes(r.ruolo)&&r.giorni[di]&&!r.impegno).length)
    return{month:m,avg:centro.reduce((a,b)=>a+b,0)/7}
  })
  return (
    <div style={{ padding:16, maxWidth:1100, margin:'0 auto' }}>
      <h1 style={{ fontSize:20, fontWeight:800, color:G.text, margin:'0 0 4px' }}>📊 Riepilogo Annuale 2026</h1>
      <p style={{ fontSize:12, color:G.textMid, margin:'0 0 16px' }}>Panoramica presenze per mese e per coach</p>
      <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, padding:16, marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:G.textMid, marginBottom:12, textTransform:'uppercase', letterSpacing:.5 }}>Media maestri al centro per mese</div>
        <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:120, overflowX:'auto' }}>
          {globalByMonth.map(({month,avg})=>{
            const h=Math.max(4,Math.round((avg/20)*100))
            return (
              <div key={month} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:52, flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, color:G.green }}>{avg>0?avg.toFixed(1):''}</div>
                <div style={{ width:'100%', height:h, background:avg>0?G.green:G.border, borderRadius:'4px 4px 0 0', minHeight:4 }}></div>
                <div style={{ fontSize:9, color:G.textMid, textAlign:'center' }}>{month.slice(0,3)}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, padding:16, marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:G.textMid, marginBottom:10, textTransform:'uppercase', letterSpacing:.5 }}>Dettaglio per coach</div>
        <select value={selCoach} onChange={e=>setSelCoach(e.target.value)}
          style={{ width:'100%', maxWidth:300, padding:'10px 12px', borderRadius:8, border:`1.5px solid ${G.border}`, background:G.bg, fontSize:13, color:G.text, outline:'none', fontFamily:'inherit' }}>
          <option value="">— seleziona coach —</option>
          {allNames.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {stats&&(
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:16 }}>
            {[{l:'Al centro',v:stats.tc,c:G.green,i:'🏠'},{l:'Torneo',v:stats.tt,c:G.red,i:'🏆'},{l:'Stage',v:stats.ts,c:G.blue,i:'🎾'},{l:'Extra',v:stats.te,c:G.purple,i:'📋'},{l:'Off',v:stats.to,c:G.orange,i:'🏖️'},{l:'Giorni tot',v:stats.tg,c:G.textMid,i:'📅'}].map(s=>(
              <div key={s.l} style={{ background:'#fff', borderRadius:10, border:`1.5px solid ${s.v>0?s.c+'40':G.border}`, padding:'14px 12px', textAlign:'center' }}>
                <div style={{ fontSize:22 }}>{s.i}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.v>0?s.c:G.textLight }}>{s.v}</div>
                <div style={{ fontSize:10, color:G.textMid, fontWeight:600 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                <thead>
                  <tr style={{ background:G.green }}>
                    {['Mese','🏠','🏆','🎾','📋','🏖️','📅'].map(h=>(
                      <th key={h} style={{ padding:'8px 10px', fontSize:11, fontWeight:700, color:'#fff', textAlign:'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((m,i)=>{
                    const d=stats.byMonth[m]
                    return (
                      <tr key={m} style={{ background:i%2===0?'#fff':'#f8faf8', opacity:d.giorni>0?1:.5 }}>
                        <td style={{ padding:'7px 10px', fontSize:12, fontWeight:600, color:G.text, borderBottom:`1px solid ${G.border}` }}>{m}</td>
                        {[{v:d.centro,c:G.green},{v:d.torneo,c:G.red},{v:d.stage,c:G.blue},{v:d.extra,c:G.purple},{v:d.off,c:G.orange},{v:d.giorni,c:G.textMid}].map((c,ci)=>(
                          <td key={ci} style={{ padding:'7px 10px', textAlign:'center', borderBottom:`1px solid ${G.border}` }}>
                            <span style={{ fontSize:13, fontWeight:c.v>0?800:400, color:c.v>0?c.c:G.textLight }}>{c.v||'—'}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Calendario ────────────────────────────────────────────────────────
function CalendarioPage({ weeks, coaches, tornei }) {
  const [calMonth, setCalMonth] = useState(5)
  const monthName=MONTHS[calMonth], sectionId=SECTIONS.find(s=>s.name===monthName)?.id
  const wks=weeks[sectionId]||[]
  const firstDay=new Date(2026,calMonth,1), daysInMonth=new Date(2026,calMonth+1,0).getDate()
  const startDow=(firstDay.getDay()+6)%7, today=new Date()
  function getMaestri(day) {
    const res=[]; wks.forEach(w=>{
      const ws=w.num,we=w.num+6
      if(day>=ws&&day<=we){const dow=day-ws;if(dow>=0&&dow<7)w.rows.forEach(r=>{if(r.giorni[dow])res.push({...r})})}
    }); return res
  }
  function getTornei(day) {
    return tornei.filter(t=>{const d=new Date(t.data);return d.getFullYear()===2026&&d.getMonth()===calMonth&&d.getDate()===day})
  }
  const cells=[]; for(let i=0;i<startDow;i++)cells.push(null); for(let d=1;d<=daysInMonth;d++)cells.push(d)
  return (
    <div style={{ padding:16, maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:G.text, margin:0 }}>📅 {monthName} 2026</h1>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>setCalMonth(m=>Math.max(0,m-1))} style={{ width:34,height:34,borderRadius:'50%',border:`1.5px solid ${G.border}`,background:'#fff',cursor:'pointer',fontSize:16 }}>‹</button>
          <select value={calMonth} onChange={e=>setCalMonth(Number(e.target.value))} style={{ padding:'6px 10px',borderRadius:20,border:`1.5px solid ${G.border}`,background:'#fff',fontFamily:'inherit',fontSize:13,outline:'none' }}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <button onClick={()=>setCalMonth(m=>Math.min(11,m+1))} style={{ width:34,height:34,borderRadius:'50%',border:`1.5px solid ${G.border}`,background:'#fff',cursor:'pointer',fontSize:16 }}>›</button>
        </div>
      </div>
      <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:G.green }}>
          {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d=>(
            <div key={d} style={{ padding:'8px 4px', textAlign:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day,i)=>{
            if(!day) return <div key={'e'+i} style={{ minHeight:80,background:'#f8faf8',borderRight:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}` }}></div>
            const m=getMaestri(day), td=getTornei(day)
            const centro=m.filter(x=>!x.impegno&&['elite','head','coach','asst','tiro','physical'].includes(x.ruolo))
            const fuori=m.filter(x=>x.impegno), travel=m.filter(x=>x.ruolo==='travel')
            const isToday=today.getFullYear()===2026&&today.getMonth()===calMonth&&today.getDate()===day
            return (
              <div key={day} style={{ minHeight:80, border:`1px solid ${G.border}`, padding:4, background:isToday?G.greenLight:'#fff' }}>
                <div style={{ fontSize:12, fontWeight:isToday?800:600, color:isToday?G.green:G.text, marginBottom:2 }}>{day}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:2, marginBottom:2 }}>
                  {centro.length>0&&<span style={{ fontSize:9,background:G.green,color:'#fff',borderRadius:3,padding:'1px 4px',fontWeight:700 }}>🏠{centro.length}</span>}
                  {fuori.length>0&&<span style={{ fontSize:9,background:G.red,color:'#fff',borderRadius:3,padding:'1px 4px',fontWeight:700 }}>🏆{fuori.length}</span>}
                  {travel.length>0&&<span style={{ fontSize:9,background:'#795548',color:'#fff',borderRadius:3,padding:'1px 4px',fontWeight:700 }}>✈️{travel.length}</span>}
                </div>
                {td.map(t=><div key={t.id} style={{ fontSize:8,background:'#fef2f2',color:G.red,borderRadius:3,padding:'1px 4px',marginBottom:1,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>🏆 {t.nome}</div>)}
                {centro.slice(0,2).map((x,xi)=><div key={xi} style={{ fontSize:8,color:G.textMid,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{x.nome.split(' ')[0]}</div>)}
                {centro.length>2&&<div style={{ fontSize:8,color:G.textLight }}>+{centro.length-2}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Coach Page ────────────────────────────────────────────────────────
function CoachPage({ coaches, weeks, onUpdateCoach, onAddCoach }) {
  const [saving, setSaving] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newRuolo, setNewRuolo] = useState('coach')
  const [newPin, setNewPin] = useState('')
  const [adding, setAdding] = useState(false)

  async function changeRuolo(coach, ruolo) {
    setSaving(coach.id)
    const ok = await SB.update('coach', `id=eq.${coach.id}`, { ruolo })
    if (ok) onUpdateCoach(coach.id, { ...coach, ruolo })
    setSaving(null)
  }
  async function handleAdd() {
    if (!newNome.trim()||!newRuolo) return
    setAdding(true)
    try {
      const pin=newPin||String(Math.floor(1000+Math.random()*9000))
      const res=await SB.insert('coach',{nome:newNome.trim(),ruolo:newRuolo,pin})
      if(res&&res[0]){onAddCoach(res[0]);setAddModal(false);setNewNome('');setNewPin('')}
    } catch(e){alert('Errore: '+e.message)}
    setAdding(false)
  }
  function getStats(nome) {
    let sc=0,st=0,ss=0,se=0,so=0,gd=0
    Object.values(weeks).forEach(wks=>wks.forEach(w=>{
      const row=w.rows.find(r=>r.nome===nome); if(!row) return
      gd+=row.giorni.filter(Boolean).length
      if(!row.impegno)sc++; else if(row.impegno==='torneo')st++
      else if(row.impegno==='stage')ss++; else if(row.ruolo==='extra'||row.impegno==='extra')se++
      else if(row.impegno==='off')so++
    }))
    return{sc,st,ss,se,so,gd}
  }
  const filtered=coaches.filter(c=>c.nome.toLowerCase().includes(search.toLowerCase()))
  const grouped=RUOLI.reduce((acc,r)=>{acc[r.key]=filtered.filter(c=>c.ruolo===r.key);return acc},{})
  const selCoach=coaches.find(c=>c.id===selected)
  const stats=selCoach?getStats(selCoach.nome):null
  return (
    <div style={{ padding:16, maxWidth:1100, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:G.text, margin:0 }}>👤 Coach</h1>
          <p style={{ fontSize:12, color:G.textMid, margin:'2px 0 0' }}>{coaches.length} coach · tocca per statistiche</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cerca..."
            style={{ padding:'8px 12px',borderRadius:20,border:`1.5px solid ${G.border}`,background:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',width:150 }} />
          <button onClick={()=>setAddModal(true)} style={{ background:G.green,color:'#fff',border:'none',borderRadius:10,padding:'9px 14px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer' }}>+ Nuovo</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:280 }}>
          {RUOLI.map(ruolo=>{
            const list=grouped[ruolo.key]||[]; if(list.length===0&&search) return null
            return (
              <div key={ruolo.key} style={{ background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,marginBottom:10,overflow:'hidden' }}>
                <div style={{ background:G.greenLight,borderBottom:`1px solid ${G.border}`,padding:'8px 12px',display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ display:'inline-block',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:ruolo.color+'20',color:ruolo.color }}>{ruolo.label}</span>
                  <span style={{ fontSize:11,color:G.textMid }}>{list.length}</span>
                </div>
                {list.length===0?<div style={{ padding:'10px 12px',color:G.textLight,fontSize:12 }}>Nessuno</div>:(
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6,padding:10 }}>
                    {list.map(coach=>(
                      <div key={coach.id} onClick={()=>setSelected(selected===coach.id?null:coach.id)}
                        style={{ display:'flex',alignItems:'center',gap:8,background:selected===coach.id?G.greenLight:G.bg,borderRadius:10,padding:'8px 12px',border:`1.5px solid ${selected===coach.id?G.green:G.border}`,cursor:'pointer' }}>
                        <div style={{ width:28,height:28,borderRadius:'50%',background:ruolo.color+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:ruolo.color,flexShrink:0 }}>
                          {coach.nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
                        </div>
                        <span style={{ fontSize:12,fontWeight:600,color:G.text }}>{coach.nome}</span>
                        <select value={coach.ruolo||'coach'} onClick={e=>e.stopPropagation()} onChange={e=>changeRuolo(coach,e.target.value)} disabled={saving===coach.id}
                          style={{ border:`1px solid ${G.border}`,borderRadius:6,padding:'2px 4px',fontSize:10,fontFamily:'inherit',background:'#fff',color:G.textMid,outline:'none',cursor:'pointer' }}>
                          {RUOLI.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
                        </select>
                        {saving===coach.id&&<span style={{ fontSize:10,color:G.textLight }}>⟳</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {selCoach&&stats&&(
          <div style={{ width:260,flexShrink:0,background:'#fff',borderRadius:12,border:`1.5px solid ${G.green}`,padding:18,boxShadow:'0 2px 12px rgba(26,107,60,0.1)',position:'sticky',top:70 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
              <div style={{ width:40,height:40,borderRadius:'50%',background:G.greenLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:G.green }}>
                {selCoach.nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:G.text }}>{selCoach.nome}</div>
                <div style={{ fontSize:11,color:G.textMid }}>{RUOLI.find(r=>r.key===selCoach.ruolo)?.label}</div>
              </div>
            </div>
            {[{l:'🏠 Al centro',v:stats.sc,c:G.green},{l:'🏆 Torneo',v:stats.st,c:G.red},{l:'🎾 Stage',v:stats.ss,c:G.blue},{l:'📋 Extra',v:stats.se,c:G.purple},{l:'🏖️ Off',v:stats.so,c:G.orange},{l:'📅 Giorni totali',v:stats.gd,c:G.textMid}].map(s=>(
              <div key={s.l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 8px',background:s.v>0?s.c+'10':'#f8f8f8',borderRadius:7,border:`1px solid ${s.v>0?s.c+'30':G.border}`,marginBottom:6 }}>
                <span style={{ fontSize:11,color:G.textMid }}>{s.l}</span>
                <span style={{ fontSize:15,fontWeight:800,color:s.v>0?s.c:G.textLight }}>{s.v}</span>
              </div>
            ))}
            <button onClick={()=>setSelected(null)} style={{ marginTop:8,width:'100%',background:'transparent',border:`1px solid ${G.border}`,borderRadius:8,padding:'6px',fontFamily:'inherit',fontSize:12,color:G.textMid,cursor:'pointer' }}>Chiudi</button>
          </div>
        )}
      </div>
      <Modal open={addModal} onClose={()=>setAddModal(false)} title="Nuovo Coach">
        <Field label="Nome completo"><FInput value={newNome} onChange={setNewNome} placeholder="es. Rossi Marco" /></Field>
        <Field label="Ruolo"><FSelect value={newRuolo} onChange={setNewRuolo} options={RUOLI.map(r=>({value:r.key,label:r.label}))} /></Field>
        <Field label="PIN (opzionale)"><FInput value={newPin} onChange={setNewPin} placeholder="es. 1234" /></Field>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
          <button onClick={()=>setAddModal(false)} style={{ background:'transparent',color:G.textMid,border:`1.5px solid ${G.border}`,padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,cursor:'pointer' }}>Annulla</button>
          <button onClick={handleAdd} disabled={!newNome.trim()||adding} style={{ background:newNome.trim()&&!adding?G.green:'#ccc',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer' }}>{adding?'...':'Aggiungi'}</button>
        </div>
      </Modal>
    </div>
  )
}

// ── WeekBlock ─────────────────────────────────────────────────────────
function WeekBlock({ week, coaches, tornei, sectionName, onUpdate, onDelete, onAddRow, onDeleteRow, onCopyNext }) {
  const [expanded, setExpanded] = useState(true)
  const { centro, torneo, travel, extra, tiroFuori, byRole } = calcCounters(week.rows)
  const monthIdx=MONTHS.indexOf(sectionName)
  let weekMon=null,weekSun=null
  if(monthIdx>=0){weekMon=new Date(2026,monthIdx,week.num);weekSun=new Date(2026,monthIdx,week.num+6)}
  const torneiSett=weekMon?tornei.filter(t=>{const d=new Date(t.data);return d>=weekMon&&d<=weekSun}):[]
  const sortedRows=sortRows(week.rows)
  const roleBreakdown=[
    {key:'elite',label:'⭐ Élite',color:'#1a6b3c'},
    {key:'head',label:'👑 Head',color:'#1565c0'},
    {key:'coach',label:'🎾 Coach',color:'#1a6b3c'},
    {key:'asst',label:'🤝 Asst.',color:'#2e7d32'},
    {key:'physical',label:'💪 Physical',color:'#f57c00'},
  ]
  return (
    <div style={{ background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,marginBottom:14,overflow:'hidden',boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
      <div style={{ background:G.greenLight,borderBottom:`1px solid ${G.border}`,padding:'10px 14px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:42,height:42,borderRadius:10,background:G.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',flexShrink:0 }}>{week.num}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:700,color:G.text }}>
              Settimana {week.num}
              {week.note&&<span style={{ fontWeight:400,color:G.textMid,marginLeft:6,fontSize:11 }}>· {week.note}</span>}
            </div>
            <div style={{ fontSize:11,color:G.textMid }}>{week.rows.length} maestri</div>
          </div>
          <button onClick={()=>setExpanded(e=>!e)} style={{ background:'none',border:'none',fontSize:18,cursor:'pointer',color:G.textMid,padding:'4px' }}>{expanded?'▲':'▼'}</button>
        </div>
        {/* Totale + breakdown */}
        <div style={{ display:'flex',gap:4,marginTop:10,overflowX:'auto',paddingBottom:2 }}>
          <div style={{ flexShrink:0,fontSize:9,fontWeight:700,color:G.textMid,alignSelf:'center',minWidth:56,whiteSpace:'nowrap' }}>TOTALE</div>
          {DAYS.map((d,i)=>(
            <div key={i} style={{ textAlign:'center',flexShrink:0 }}>
              <div style={{ fontSize:9,color:G.textLight,fontWeight:700,marginBottom:2 }}>{d}</div>
              <div style={{ width:30,height:26,borderRadius:6,background:centro[i]>0?G.green:'#f0f4f0',color:centro[i]>0?'#fff':G.textLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800 }}>{centro[i]||'—'}</div>
            </div>
          ))}
          <div style={{ flexShrink:0,display:'flex',gap:4,marginLeft:8 }}>
            <button onClick={onAddRow} style={{ background:'#fff',border:`1.5px solid ${G.green}`,color:G.green,borderRadius:8,padding:'4px 12px',fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>+ Maestro</button>
            <button onClick={onCopyNext} title="Copia maestri nella settimana successiva" style={{ background:'#fff',border:`1.5px solid ${G.blue}`,color:G.blue,borderRadius:8,padding:'4px 8px',fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>📋 +7</button>
            <button onClick={onDelete} style={{ background:'#fef2f2',border:`1.5px solid #fecaca`,color:G.red,borderRadius:8,padding:'4px 8px',fontFamily:'inherit',fontSize:12,cursor:'pointer' }}>✕</button>
          </div>
        </div>
        {expanded&&(
          <div style={{ marginTop:6,display:'flex',flexDirection:'column',gap:3 }}>
            {roleBreakdown.filter(r=>byRole[r.key]?.reduce((a,b)=>a+b,0)>0).map(r=>(
              <div key={r.key} style={{ display:'flex',gap:4,alignItems:'center',overflowX:'auto' }}>
                <div style={{ flexShrink:0,fontSize:9,fontWeight:700,color:r.color,minWidth:56,whiteSpace:'nowrap' }}>{r.label}</div>
                {DAYS.map((d,i)=>(
                  <div key={i} style={{ textAlign:'center',flexShrink:0,width:30 }}>
                    <div style={{ height:20,borderRadius:4,background:byRole[r.key][i]>0?r.color+'20':'transparent',color:byRole[r.key][i]>0?r.color:G.textLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700 }}>
                      {byRole[r.key][i]||''}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {expanded&&<div style={{ marginTop:8,display:'flex',flexDirection:'column',gap:4 }}>
          <StatBar label="🏆 Torneo" color={G.red} values={torneo} />
          <StatBar label="✈️ Travel" color={'#795548'} values={travel} />
          <StatBar label="📋 Extra" color={'#9e9e9e'} values={extra} />
        </div>}
        {expanded&&torneiSett.length>0&&(
          <div style={{ marginTop:8,display:'flex',flexWrap:'wrap',gap:5 }}>
            {torneiSett.map(t=>{
              const c1=coaches.find(c=>c.id===t.coach_id), c2=coaches.find(c=>c.id===t.coach_id_2)
              return (
                <div key={t.id} style={{ background:'#fff',border:`1px solid ${G.border}`,borderRadius:8,padding:'4px 8px',fontSize:11 }}>
                  <span style={{ fontWeight:700,color:G.red }}>🏆 {t.nome}</span>
                  <span style={{ color:G.textMid,marginLeft:5 }}>{new Date(t.data).toLocaleDateString('it-IT',{day:'numeric',month:'short'})}</span>
                  {(c1||c2)&&<span style={{ color:G.green,marginLeft:5,fontWeight:600 }}>· {[c1,c2].filter(Boolean).map(c=>c.nome.split(' ')[0]).join(', ')}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
      {expanded&&week.rows.length===0&&(
        <div style={{ padding:'20px',textAlign:'center',color:G.textLight,fontSize:13 }}>Nessun maestro — clicca <strong>+ Maestro</strong></div>
      )}
      {expanded&&week.rows.length>0&&(
        <div style={{ overflowX:'auto' }}>
          <div style={{ display:'flex',gap:0,minWidth:'max-content' }}>
            {ROLE_ORDER.filter(rk=>sortedRows.some(r=>r.ruolo===rk)).map((rk)=>{
              const ruoloInfo=RUOLI.find(r=>r.key===rk)
              const rowsOfRole=sortedRows.filter(r=>r.ruolo===rk)
              return (
                <div key={rk} style={{ borderRight:`1px solid #e8f0e8`,minWidth:160,maxWidth:200,flex:1 }}>
                  <div style={{ padding:'5px 8px',background:'#f4faf4',borderBottom:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:5 }}>
                    <span style={{ fontSize:10,fontWeight:700,color:ruoloInfo?.color||G.textMid,textTransform:'uppercase',letterSpacing:.3 }}>{ruoloInfo?.label||rk}</span>
                    <span style={{ fontSize:10,color:G.textLight,marginLeft:'auto' }}>{rowsOfRole.length}</span>
                  </div>
                  {rowsOfRole.map((row,ri)=>{
                    const impegnoInfo=IMPEGNI.find(i=>i.key===row.impegno)
                    return (
                      <div key={row.id} style={{ padding:'5px 8px',borderBottom:`1px solid #f0f5f0`,background:row.impegno?impegnoInfo?.color+'08':ri%2===0?'#fff':'#fafcfa' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:4,marginBottom:4 }}>
                          <input defaultValue={row.nome} onBlur={e=>onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,nome:e.target.value}:r)})}
                            style={{ flex:1,minWidth:0,border:'none',background:'transparent',fontSize:11,fontWeight:600,color:G.text,outline:'none',fontFamily:'inherit',overflow:'hidden',textOverflow:'ellipsis' }} />
                          <button onClick={()=>onDeleteRow(row.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:12,padding:'0 2px',flexShrink:0,lineHeight:1 }}
                            onMouseEnter={e=>e.target.style.color=G.red} onMouseLeave={e=>e.target.style.color='#ddd'}>✕</button>
                        </div>
                        <select value={row.impegno||''} onChange={e=>onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,impegno:e.target.value}:r)})}
                          style={{ width:'100%',border:`1px solid ${G.border}`,borderRadius:4,padding:'2px 4px',fontSize:10,fontFamily:'inherit',background:impegnoInfo?impegnoInfo.color+'15':'#f8f8f8',color:impegnoInfo?.color||G.textLight,fontWeight:600,outline:'none',cursor:'pointer',marginBottom:4 }}>
                          <option value="">🏠 al centro</option>
                          {IMPEGNI.map(imp=><option key={imp.key} value={imp.key}>{imp.label}</option>)}
                        </select>
                        <div style={{ display:'flex',gap:2 }}>
                          {DAYS.map((d,di)=>(
                            <button key={di} onClick={()=>{ const ng=[...row.giorni]; ng[di]=!ng[di]; onUpdate({...week,rows:week.rows.map(r=>r.id===row.id?{...r,giorni:ng}:r)}) }}
                              style={{ flex:1,height:20,borderRadius:3,border:`1.5px solid ${row.giorni[di]?ruoloInfo?.color||G.green:G.border}`,background:row.giorni[di]?ruoloInfo?.color||G.green:'#fff',color:row.giorni[di]?'#fff':G.textLight,cursor:'pointer',fontSize:8,fontWeight:700,padding:0 }}>
                              {row.giorni[di]?'✓':d}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState('planner')
  const [sections] = useState(SECTIONS)
  const [active, setActive] = useState('s6')
  const [weeks, setWeeks] = useState({})
  const [dbLoading, setDbLoading] = useState(true)
  const [coaches, setCoaches] = useState([])
  const [tornei, setTornei] = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const [flashSave, setFlashSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const wsRef = useRef(null)

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
    if(typeof window!=='undefined'&&sessionStorage.getItem('ptc_auth')==='1') setLoggedIn(true)
  },[])

  function doLogin(){ sessionStorage.setItem('ptc_auth','1'); setLoggedIn(true) }
  function doLogout(){ sessionStorage.removeItem('ptc_auth'); setLoggedIn(false) }

  // Carica tutto da Supabase
  const loadAll = useCallback(async()=>{
    setSyncStatus('loading')
    try {
      const [w, c, t] = await Promise.all([
        dbLoadWeeks(),
        SB.get('coach','select=*&order=nome'),
        SB.get('tornei','select=*&order=data'),
      ])
      setWeeks(w); setCoaches(c); setTornei(t)
      setSyncStatus('ok')
    } catch(e){ console.error(e); setSyncStatus('error') }
    setDbLoading(false)
  },[])

  useEffect(()=>{ if(loggedIn) loadAll() },[loggedIn, loadAll])

  // Realtime
  useEffect(()=>{
    if(!loggedIn) return
    try {
      const ws=new WebSocket(`wss://gpveyzkjurmzcowpwemm.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`)
      ws.onopen=()=>{ ['tornei','coach'].forEach(t=>ws.send(JSON.stringify({topic:`realtime:public:${t}`,event:'phx_join',payload:{},ref:null}))) }
      ws.onmessage=(e)=>{
        const msg=JSON.parse(e.data)
        if(msg.event==='INSERT'||msg.event==='UPDATE'||msg.event==='DELETE'){
          if(msg.topic?.includes('tornei')) loadAll()
          if(msg.topic?.includes('coach')) SB.get('coach','select=*&order=nome').then(setCoaches)
        }
      }
      wsRef.current=ws
      return()=>ws.close()
    } catch(e){ const iv=setInterval(loadAll,30000); return()=>clearInterval(iv) }
  },[loggedIn,loadAll])

  function updateCoach(id,updated){ setCoaches(prev=>prev.map(c=>c.id===id?updated:c)) }
  function addCoach(coach){ setCoaches(prev=>[...prev,coach].sort((a,b)=>a.nome.localeCompare(b.nome))) }

  const wks=weeks[active]||[]
  const activeSection=sections.find(s=>s.id===active)
  const totalCentro=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).centro[di],0))
  const totalTorneo=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).torneo[di],0))
  const totalTravel=DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).travel[di],0))
  const totalExtra =DAYS.map((_,di)=>wks.reduce((sum,w)=>sum+calcCounters(w.rows).extra[di],0))

  // Update week in state + Supabase
  async function updateWeek(updated) {
    setWeeks(prev=>({...prev,[active]:prev[active].map(w=>w.id===updated.id?updated:w)}))
    setSaving(true)
    try {
      await dbSaveWeek(active, updated)
      // Salva tutte le righe modificate
      await Promise.all(updated.rows.map(r=>dbSaveRow(updated.id, r)))
    } catch(e){ console.error('Save error',e) }
    setSaving(false); doFlash()
  }

  async function addWeek(num, note) {
    const week = { id: uid(), num, note: note||'', rows:[] }
    setWeeks(prev=>({...prev,[active]:[...(prev[active]||[]),week]}))
    await dbSaveWeek(active, week)
    doFlash()
  }

  async function deleteWeek(weekId) {
    setWeeks(prev=>({...prev,[active]:(prev[active]||[]).filter(w=>w.id!==weekId)}))
    await dbDeleteWeek(weekId)
    doFlash()
  }

  async function addRow(weekId, row) {
    setWeeks(prev=>({...prev,[active]:(prev[active]||[]).map(w=>w.id===weekId?{...w,rows:[...w.rows,row]}:w)}))
    await dbSaveRow(weekId, row)
    doFlash()
  }

  async function deleteRow(weekId, rowId) {
    setWeeks(prev=>({...prev,[active]:(prev[active]||[]).map(w=>w.id===weekId?{...w,rows:w.rows.filter(r=>r.id!==rowId)}:w)}))
    await dbDeleteRow(rowId)
    doFlash()
  }

  async function copyWeekToNext(week) {
    const nextNum = week.num + 7
    // Check if a week with that num already exists
    const existing = wks.find(w => w.num === nextNum)
    const newRows = week.rows.map(r => ({ ...r, id: uid() }))
    if (existing) {
      // Merge: add rows that don't already exist (by name+role)
      const toAdd = newRows.filter(nr => !existing.rows.some(er => er.nome === nr.nome && er.ruolo === nr.ruolo))
      if (toAdd.length === 0) { alert('La settimana '+nextNum+' esiste già con gli stessi maestri.'); return }
      const updated = { ...existing, rows: [...existing.rows, ...toAdd] }
      await updateWeek(updated)
      alert(`✅ Aggiunti ${toAdd.length} maestri alla settimana ${nextNum}`)
    } else {
      const newWeek = { id: uid(), num: nextNum, note: week.note, rows: newRows }
      setWeeks(prev => ({ ...prev, [active]: [...(prev[active]||[]), newWeek].sort((a,b)=>a.num-b.num) }))
      await dbSaveWeek(active, newWeek)
      await Promise.all(newRows.map(r => dbSaveRow(newWeek.id, r)))
      doFlash()
    }
  }

  function openAddRow(weekId){ setModalRow(weekId); setNewNome(''); setNewRuolo(''); setNewImpegno(''); setNewCoachId(''); setNewGiorni([false,false,false,false,false,false,false]) }

  async function copyMonthToNext() {
    const currentSec = sections.find(s => s.id === active)
    const currentIdx = MONTHS.indexOf(currentSec?.name)
    if (currentIdx < 0 || currentIdx >= 11) { alert('Impossibile copiare: seleziona un mese valido (non Dicembre).'); return }
    const nextMonthName = MONTHS[currentIdx + 1]
    const nextSec = SECTIONS.find(s => s.name === nextMonthName)
    if (!nextSec) return
    const currentWks = weeks[active] || []
    if (currentWks.length === 0) { alert('Nessuna settimana da copiare.'); return }
    const confirmed = window.confirm(`Copia tutte le settimane di ${currentSec.name} in ${nextMonthName}?\n\nLe settimane esistenti in ${nextMonthName} non verranno sovrascritte.`)
    if (!confirmed) return
    const nextWks = [...(weeks[nextSec.id] || [])]
    let added = 0
    for (const week of currentWks) {
      if (nextWks.some(w => w.num === week.num)) continue
      const newRows = week.rows.map(r => ({ ...r, id: uid() }))
      const newWeek = { id: uid(), num: week.num, note: week.note, rows: newRows }
      nextWks.push(newWeek)
      await dbSaveWeek(nextSec.id, newWeek)
      await Promise.all(newRows.map(r => dbSaveRow(newWeek.id, r)))
      added++
    }
    setWeeks(prev => ({ ...prev, [nextSec.id]: [...nextWks].sort((a,b)=>a.num-b.num) }))
    doFlash()
    alert(`✅ Copiate ${added} settimane in ${nextMonthName}!`)
  }

  function confirmAddRow(){
    if(!newRuolo) return
    const coachSupa=coaches.find(c=>String(c.id)===newCoachId)
    const nome=coachSupa?coachSupa.nome:newNome.trim()
    const ruolo=coachSupa&&coachSupa.ruolo?coachSupa.ruolo:newRuolo
    if(!nome) return
    const row={id:uid(),nome,ruolo,giorni:newGiorni,impegno:newImpegno,coachId:newCoachId||null}
    addRow(modalRow, row)
    setModalRow(null)
  }

  function confirmAddWeek(){
    const num=parseInt(newWeekNum)||((wks.slice(-1)[0]?.num||0)+7)
    addWeek(num, newWeekNote.trim())
    setModalWeek(false); setNewWeekNum(''); setNewWeekNote('')
  }

  function doFlash(){ setFlashSave(true); setTimeout(()=>setFlashSave(false),2000) }

  if(!loggedIn) return <LoginPage onLogin={doLogin} />

  if(dbLoading) return (
    <div style={{ minHeight:'100vh',background:G.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16 }}>
      <div style={{ width:50,height:50,borderRadius:'50%',background:`linear-gradient(135deg,${G.green},${G.greenMid})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>🎾</div>
      <div style={{ fontSize:14,color:G.textMid,fontWeight:600 }}>Caricamento dati...</div>
    </div>
  )

  const PAGES=[{key:'planner',label:'📋 Planner'},{key:'calendario',label:'📅 Calendario'},{key:'dashboard',label:'📊 Riepilogo'},{key:'coach',label:'👤 Coach'}]

  return (
    <div style={{ minHeight:'100vh',background:G.bg }}>
      <nav style={{ background:'#fff',borderBottom:`1px solid ${G.border}`,padding:'0 14px',height:54,display:'flex',alignItems:'center',gap:8,position:'sticky',top:0,zIndex:200,boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:7,flexShrink:0 }}>
          <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${G.green},${G.greenMid})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>🎾</div>
          <div>
            <div style={{ fontSize:11,fontWeight:800,color:G.green,lineHeight:1.1 }}>PIATTI TC</div>
            <div style={{ fontSize:8,fontWeight:600,color:G.greenMid }}>PLANNER</div>
          </div>
        </div>
        <div style={{ display:'flex',gap:3,flexShrink:0 }}>
          {PAGES.map(p=>(
            <button key={p.key} onClick={()=>setPage(p.key)} style={{ background:page===p.key?G.green:'transparent',color:page===p.key?'#fff':G.textMid,border:page===p.key?'none':`1.5px solid ${G.border}`,borderRadius:20,padding:'4px 10px',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap' }}>{p.label}</button>
          ))}
          <a href={TORNEI_URL} target="_blank" rel="noopener noreferrer"
            style={{ background:'transparent',color:G.textMid,border:`1.5px solid ${G.border}`,borderRadius:20,padding:'4px 10px',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer',textDecoration:'none',display:'flex',alignItems:'center' }}>🏆 ↗</a>
        </div>
        {page==='planner'&&(
          <div style={{ flex:1,display:'flex',gap:3,overflowX:'auto',scrollbarWidth:'none',padding:'2px 0' }}>
            {sections.map(s=>(
              <button key={s.id} onClick={()=>setActive(s.id)} style={{ background:s.id===active?G.green:'transparent',color:s.id===active?'#fff':G.textMid,border:s.id===active?'none':`1.5px solid ${G.border}`,borderRadius:20,padding:'4px 10px',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0 }}>{s.name}</button>
            ))}
          </div>
        )}
        {page!=='planner'&&<div style={{ flex:1 }}></div>}
        <div style={{ display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
          {syncStatus==='ok'&&<span style={{ fontSize:10,color:G.green }}>🔗</span>}
          {syncStatus==='error'&&<button onClick={loadAll} style={{ color:G.red,background:'none',border:'none',cursor:'pointer',fontSize:11 }}>⚠️</button>}
          {saving&&<span style={{ fontSize:10,color:G.textLight }}>⟳</span>}
          <span style={{ color:flashSave?G.green:G.textLight,transition:'color .3s',fontSize:12 }}>{flashSave?'✅':'☁️'}</span>
          <button onClick={doLogout} title="Esci" style={{ background:'none',border:`1px solid ${G.border}`,borderRadius:8,padding:'4px 8px',cursor:'pointer',fontSize:11,color:G.textMid }}>🚪</button>
        </div>
      </nav>

      {page==='coach'&&<CoachPage coaches={coaches} weeks={weeks} onUpdateCoach={updateCoach} onAddCoach={addCoach} />}
      {page==='calendario'&&<CalendarioPage weeks={weeks} coaches={coaches} tornei={tornei} />}
      {page==='dashboard'&&<DashboardPage weeks={weeks} coaches={coaches} />}

      {page==='planner'&&(
        <div style={{ padding:14,maxWidth:1400,margin:'0 auto' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:10 }}>
            <div>
              <h1 style={{ fontSize:20,fontWeight:800,color:G.text,margin:0 }}>{activeSection?.name} 2026</h1>
              <p style={{ fontSize:12,color:G.textMid,margin:'2px 0 0' }}>{wks.length} sett. · {wks.reduce((s,w)=>s+w.rows.length,0)} maestri · ☁️ salvato su cloud</p>
            </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={copyMonthToNext} title="Copia tutte le settimane nel mese successivo"
              style={{ background:'#fff',border:`1.5px solid ${G.blue}`,color:G.blue,borderRadius:10,padding:'9px 14px',fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
              📋 Copia mese →
            </button>
            <button onClick={()=>setModalWeek(true)} style={{ background:G.green,color:'#fff',border:'none',borderRadius:10,padding:'9px 16px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>+ Settimana</button>
          </div>
          </div>
          <div style={{ background:'#fff',border:`1px solid ${G.border}`,borderRadius:10,padding:'12px 14px',marginBottom:14,boxShadow:'0 1px 4px rgba(26,107,60,0.05)' }}>
            <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
              <StatBar label="🏠 Al centro" color={G.green} values={totalCentro} />
              <StatBar label="🏆 Torneo" color={G.red} values={totalTorneo} />
              <StatBar label="✈️ Travelling" color={'#795548'} values={totalTravel} />
              <StatBar label="📋 Extra" color={'#9e9e9e'} values={totalExtra} />
            </div>
          </div>
          {wks.length===0&&(
            <div style={{ textAlign:'center',padding:'50px 0',color:G.textLight }}>
              <div style={{ fontSize:44,marginBottom:10 }}>📋</div>
              <div style={{ fontSize:15,fontWeight:600 }}>Nessuna settimana</div>
              <div style={{ fontSize:12,marginTop:4 }}>Clicca &ldquo;+ Settimana&rdquo; per iniziare</div>
            </div>
          )}
          {wks.map(week=>(
            <WeekBlock key={week.id} week={week} coaches={coaches} tornei={tornei}
              sectionName={activeSection?.name||''}
              onUpdate={updateWeek} onDelete={()=>deleteWeek(week.id)}
              onAddRow={()=>openAddRow(week.id)} onDeleteRow={rowId=>deleteRow(week.id,rowId)}
              onCopyNext={()=>copyWeekToNext(week)} />
          ))}
        </div>
      )}

      <Modal open={!!modalRow} onClose={()=>setModalRow(null)} title="Aggiungi Maestro">
        <Field label="Scegli coach">
          <FSelect value={newCoachId} onChange={v=>{ setNewCoachId(v); const c=coaches.find(c=>String(c.id)===v); if(c){setNewNome(c.nome);if(c.ruolo)setNewRuolo(c.ruolo)} }} options={[{value:'',label:'— seleziona —'},...coaches.map(c=>({value:String(c.id),label:`${c.nome} · ${RUOLI.find(r=>r.key===c.ruolo)?.label||''}`}))]} />
        </Field>
        <Field label="oppure nome manuale">
          <FInput value={newNome} onChange={setNewNome} placeholder="Nome maestro" />
        </Field>
        <Field label="Ruolo">
          <FSelect value={newRuolo} onChange={setNewRuolo} options={[{value:'',label:'— seleziona —'},...RUOLI.map(r=>({value:r.key,label:r.label}))]} />
        </Field>
        <Field label="Impegno">
          <FSelect value={newImpegno} onChange={setNewImpegno} options={[{value:'',label:'— al centro —'},...IMPEGNI.map(i=>({value:i.key,label:i.label}))]} />
        </Field>
        <Field label="Giorni presenti">
          <DayPicker selected={newGiorni} onChange={setNewGiorni} />
        </Field>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:8 }}>
          <button onClick={()=>setModalRow(null)} style={{ background:'transparent',color:G.textMid,border:`1.5px solid ${G.border}`,padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,cursor:'pointer' }}>Annulla</button>
          <button onClick={confirmAddRow} disabled={!newRuolo||(!newNome.trim()&&!newCoachId)} style={{ background:(newRuolo&&(newNome.trim()||newCoachId))?G.green:'#ccc',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer' }}>Aggiungi</button>
        </div>
      </Modal>

      <Modal open={modalWeek} onClose={()=>setModalWeek(false)} title="Nuova Settimana">
        <Field label="Giorno iniziale (es. 1, 8, 15, 22, 29)">
          <FInput value={newWeekNum} onChange={setNewWeekNum} placeholder={String((wks.slice(-1)[0]?.num||0)+7)} onKeyDown={e=>e.key==='Enter'&&confirmAddWeek()} />
        </Field>
        <Field label="Nota (opzionale)">
          <FInput value={newWeekNote} onChange={setNewWeekNote} placeholder="es. Stage, Monte Carlo…" />
        </Field>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
          <button onClick={()=>setModalWeek(false)} style={{ background:'transparent',color:G.textMid,border:`1.5px solid ${G.border}`,padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,cursor:'pointer' }}>Annulla</button>
          <button onClick={confirmAddWeek} style={{ background:G.green,color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer' }}>Crea</button>
        </div>
      </Modal>
    </div>
  )
}
