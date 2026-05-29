'use client'
import { useState, useEffect, useCallback } from 'react'

const SUPABASE_URL = 'https://gpveyzkjurmzcowpwemm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdmV5emtqdXJtemNvd3B3ZW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE5MTQsImV4cCI6MjA5NTEyNzkxNH0.Xtyg0ztnJya_TaAMV49sU47E0uQeFcizLdhDKZi2wD0'
const TORNEI_URL = 'https://tennis-tornei.vercel.app'

const G = {
  bg:'#f0faf0', border:'#d4e8d0', green:'#1a6b3c',
  greenLight:'#e8f5e9', greenMid:'#4caf50',
  text:'#1a2e1a', textMid:'#4a6741', textLight:'#8aaa85',
  red:'#e53935', orange:'#f57c00', blue:'#1565c0', purple:'#6a1b9a',
}

const DAYS = ['L','M','M','G','V','S','D']
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

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

function uid() { return 'id'+Math.random().toString(36).slice(2,9) }

async function sbFetch(table, params='') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` }
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}
async function sbPatch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:'PATCH',
    headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json', Prefer:'return=minimal' },
    body:JSON.stringify(data)
  })
  return res.ok
}
async function sbInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:'POST',
    headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation' },
    body:JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Insert failed ${res.status}`)
  return res.json()
}

function calcCounters(rows) {
  const centro    = DAYS.map((_,di)=>rows.filter(r=>['head','coach','asst','tiro'].includes(r.ruolo)&&r.giorni[di]&&!r.impegno).length)
  const torneo    = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.impegno==='torneo').length)
  const travel    = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='travel').length)
  const extra     = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='extra').length)
  const tiroFuori = DAYS.map((_,di)=>rows.filter(r=>r.giorni[di]&&r.ruolo==='tiro'&&r.impegno).length)
  return { centro, torneo, travel, extra, tiroFuori }
}

const STORAGE_KEY = 'ptc_planner_v4'
function loadState() {
  if (typeof window==='undefined') return null
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null') } catch { return null }
}
function saveState(data) {
  if (typeof window==='undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// ── UI ────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:28, width:wide?680:480, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
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

// ── Pagina Coach ──────────────────────────────────────────────────────
function CoachPage({ coaches, weeks, sections, onUpdateCoach, onAddCoach }) {
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
    const ok = await sbPatch('coach', coach.id, { ruolo })
    if (ok) onUpdateCoach(coach.id, { ...coach, ruolo })
    setSaving(null)
  }

  async function handleAddCoach() {
    if (!newNome.trim() || !newRuolo) return
    setAdding(true)
    try {
      const pin = newPin || String(Math.floor(1000+Math.random()*9000))
      const res = await sbInsert('coach', { nome:newNome.trim(), ruolo:newRuolo, pin })
      if (res && res[0]) { onAddCoach(res[0]); setAddModal(false); setNewNome(''); setNewPin('') }
    } catch(e) { alert('Errore salvataggio: '+e.message) }
    setAdding(false)
  }

  // Statistiche per coach selezionato
  function getStats(coachNome) {
    let settCentro=0, settTorneo=0, settExtra=0, settStage=0, settOff=0, totGiorni=0
    Object.entries(weeks).forEach(([secId, wks])=>{
      wks.forEach(w=>{
        const row = w.rows.find(r=>r.nome===coachNome || (r.coachId && coaches.find(c=>String(c.id)===r.coachId&&c.nome===coachNome)))
        if (!row) return
        const giorniPresenti = row.giorni.filter(Boolean).length
        totGiorni += giorniPresenti
        if (!row.impegno) settCentro++
        else if (row.impegno==='torneo') settTorneo++
        else if (row.impegno==='extra'||row.ruolo==='extra') settExtra++
        else if (row.impegno==='stage') settStage++
        else if (row.impegno==='off') settOff++
      })
    })
    return { settCentro, settTorneo, settExtra, settStage, settOff, totGiorni }
  }

  const filtered = coaches.filter(c=>c.nome.toLowerCase().includes(search.toLowerCase()))
  const grouped = RUOLI.reduce((acc,r)=>{ acc[r.key]=filtered.filter(c=>c.ruolo===r.key); return acc },{})
  const selectedCoach = coaches.find(c=>c.id===selected)
  const stats = selectedCoach ? getStats(selectedCoach.nome) : null

  return (
    <div style={{ padding:20, maxWidth:1100, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:G.text, margin:0 }}>Gestione Coach</h1>
          <p style={{ fontSize:13, color:G.textMid, margin:'3px 0 0' }}>{coaches.length} coach · clicca su un coach per vedere le statistiche</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cerca..."
            style={{ padding:'8px 14px', borderRadius:20, border:`1.5px solid ${G.border}`, background:'#fff', fontSize:13, outline:'none', fontFamily:'inherit', width:180 }} />
          <button onClick={()=>setAddModal(true)} style={{ background:G.green, color:'#fff', border:'none', borderRadius:10, padding:'9px 16px', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Nuovo Coach</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
        {/* Lista */}
        <div style={{ flex:1, minWidth:300 }}>
          {RUOLI.map(ruolo=>{
            const list = grouped[ruolo.key]||[]
            if (list.length===0&&search) return null
            return (
              <div key={ruolo.key} style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, marginBottom:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(26,107,60,0.06)' }}>
                <div style={{ background:G.greenLight, borderBottom:`1px solid ${G.border}`, padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:ruolo.color+'20', color:ruolo.color }}>{ruolo.label}</span>
                  <span style={{ fontSize:11, color:G.textMid }}>{list.length}</span>
                </div>
                {list.length===0 ? (
                  <div style={{ padding:'10px 14px', color:G.textLight, fontSize:12 }}>Nessuno</div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:10 }}>
                    {list.map(coach=>(
                      <div key={coach.id} onClick={()=>setSelected(selected===coach.id?null:coach.id)}
                        style={{ display:'flex', alignItems:'center', gap:8, background:selected===coach.id?G.greenLight:G.bg, borderRadius:10, padding:'7px 12px', border:`1.5px solid ${selected===coach.id?G.green:G.border}`, cursor:'pointer', transition:'all .15s' }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:ruolo.color+'30', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:ruolo.color }}>
                          {coach.nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:G.text }}>{coach.nome}</span>
                        <select value={coach.ruolo||'coach'} onClick={e=>e.stopPropagation()} onChange={e=>changeRuolo(coach,e.target.value)}
                          disabled={saving===coach.id}
                          style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:'2px 5px', fontSize:10, fontFamily:'inherit', background:'#fff', color:G.textMid, outline:'none', cursor:'pointer' }}>
                          {RUOLI.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
                        </select>
                        {saving===coach.id&&<span style={{ fontSize:10, color:G.textLight }}>⟳</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Statistiche coach selezionato */}
        {selectedCoach&&stats&&(
          <div style={{ width:280, flexShrink:0, background:'#fff', borderRadius:12, border:`1px solid ${G.green}`, padding:20, boxShadow:'0 2px 12px rgba(26,107,60,0.1)', position:'sticky', top:80 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:G.greenLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:G.green }}>
                {selectedCoach.nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:G.text }}>{selectedCoach.nome}</div>
                <div style={{ fontSize:11, color:G.textMid }}>{RUOLI.find(r=>r.key===selectedCoach.ruolo)?.label||selectedCoach.ruolo}</div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'🏠 Settimane al centro', val:stats.settCentro, color:G.green },
                { label:'🏆 Settimane in torneo', val:stats.settTorneo, color:G.red },
                { label:'🎾 Settimane in stage',  val:stats.settStage,  color:G.blue },
                { label:'📋 Settimane extra',     val:stats.settExtra,  color:G.purple },
                { label:'🏖️ Settimane off',       val:stats.settOff,    color:G.orange },
                { label:'📅 Giorni totali',       val:stats.totGiorni,  color:G.textMid },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:s.val>0?s.color+'10':'#f8f8f8', borderRadius:8, border:`1px solid ${s.val>0?s.color+'30':G.border}` }}>
                  <span style={{ fontSize:12, color:G.textMid }}>{s.label}</span>
                  <span style={{ fontSize:16, fontWeight:800, color:s.val>0?s.color:G.textLight }}>{s.val}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setSelected(null)} style={{ marginTop:14, width:'100%', background:'transparent', border:`1px solid ${G.border}`, borderRadius:8, padding:'7px', fontFamily:'inherit', fontSize:12, color:G.textMid, cursor:'pointer' }}>Chiudi</button>
          </div>
        )}
      </div>

      {/* Modal nuovo coach */}
      <Modal open={addModal} onClose={()=>setAddModal(false)} title="Nuovo Coach">
        <Field label="Nome completo">
          <FInput value={newNome} onChange={setNewNome} placeholder="es. Rossi Marco" />
        </Field>
        <Field label="Ruolo">
          <FSelect value={newRuolo} onChange={setNewRuolo} options={RUOLI.map(r=>({value:r.key,label:r.label}))} />
        </Field>
        <Field label="PIN (opzionale — generato automaticamente se vuoto)">
          <FInput value={newPin} onChange={setNewPin} placeholder="es. 1234" />
        </Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={()=>setAddModal(false)} style={{ background:'transparent', color:G.textMid, border:`1.5px solid ${G.border}`, padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>Annulla</button>
          <button onClick={handleAddCoach} disabled={!newNome.trim()||adding} style={{ background:newNome.trim()&&!adding?G.green:'#ccc', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {adding?'Salvataggio...':'Aggiungi'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── Vista Calendario ──────────────────────────────────────────────────
function CalendarioPage({ weeks, sections, coaches, tornei }) {
  const [calMonth, setCalMonth] = useState(5) // 0-based, default Giugno

  const monthName = MONTHS[calMonth]
  const sectionId = SECTIONS.find(s=>s.name===monthName)?.id
  const wks = weeks[sectionId]||[]

  // Giorni del mese
  const firstDay = new Date(2026, calMonth, 1)
  const daysInMonth = new Date(2026, calMonth+1, 0).getDate()
  const startDow = (firstDay.getDay()+6)%7 // 0=Lun

  // Mappa giorno → maestri presenti
  function getMaestriForDay(dayNum) {
    const results = []
    wks.forEach(w=>{
      // Il giorno cade in questa settimana?
      const weekStart = w.num
      const weekEnd = w.num+6
      if (dayNum>=weekStart&&dayNum<=weekEnd) {
        const dow = (dayNum-weekStart) // 0=Lun
        if (dow>=0&&dow<7) {
          w.rows.forEach(r=>{
            if (r.giorni[dow]) results.push({ ...r, weekNum:w.num })
          })
        }
      }
    })
    return results
  }

  // Tornei di quel giorno
  function getTorneiForDay(dayNum) {
    return tornei.filter(t=>{
      const d = new Date(t.data)
      return d.getFullYear()===2026&&d.getMonth()===calMonth&&d.getDate()===dayNum
    })
  }

  const cells = []
  for (let i=0;i<startDow;i++) cells.push(null)
  for (let d=1;d<=daysInMonth;d++) cells.push(d)

  const today = new Date()
  const isToday = (d) => today.getFullYear()===2026&&today.getMonth()===calMonth&&today.getDate()===d

  return (
    <div style={{ padding:20, maxWidth:1200, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:G.text, margin:0 }}>📅 Calendario {monthName} 2026</h1>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={()=>setCalMonth(m=>Math.max(0,m-1))} style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${G.border}`, background:'#fff', cursor:'pointer', fontSize:16 }}>‹</button>
          <select value={calMonth} onChange={e=>setCalMonth(Number(e.target.value))}
            style={{ padding:'6px 12px', borderRadius:20, border:`1.5px solid ${G.border}`, background:'#fff', fontFamily:'inherit', fontSize:13, outline:'none', cursor:'pointer' }}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <button onClick={()=>setCalMonth(m=>Math.min(11,m+1))} style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${G.border}`, background:'#fff', cursor:'pointer', fontSize:16 }}>›</button>
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        {[{color:G.green,label:'Al centro'},{color:G.red,label:'Torneo'},{color:G.blue,label:'Travelling'},{color:G.purple,label:'Extra'},{color:G.orange,label:'Off'}].map(l=>(
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:G.textMid }}>
            <div style={{ width:10, height:10, borderRadius:3, background:l.color }}></div>{l.label}
          </div>
        ))}
      </div>

      {/* Griglia */}
      <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, overflow:'hidden', boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
        {/* Header giorni */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:G.green }}>
          {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d=>(
            <div key={d} style={{ padding:'8px', textAlign:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{d}</div>
          ))}
        </div>
        {/* Celle */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day,i)=>{
            if (!day) return <div key={'e'+i} style={{ minHeight:90, background:'#f8faf8', borderRight:`1px solid ${G.border}`, borderBottom:`1px solid ${G.border}` }}></div>
            const maestri = getMaestriForDay(day)
            const torneiDay = getTorneiForDay(day)
            const centro = maestri.filter(m=>!m.impegno&&['head','coach','asst','tiro'].includes(m.ruolo))
            const fuori = maestri.filter(m=>m.impegno)
            const travel = maestri.filter(m=>m.ruolo==='travel')
            return (
              <div key={day} style={{ minHeight:90, border:`1px solid ${G.border}`, padding:4, background:isToday(day)?'#e8f5e9':'#fff', position:'relative' }}>
                <div style={{ fontSize:12, fontWeight:isToday(day)?800:600, color:isToday(day)?G.green:G.text, marginBottom:3 }}>{day}</div>
                {/* Contatori */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:2, marginBottom:3 }}>
                  {centro.length>0&&<span style={{ fontSize:9, background:G.green, color:'#fff', borderRadius:3, padding:'1px 4px', fontWeight:700 }}>🏠{centro.length}</span>}
                  {fuori.length>0&&<span style={{ fontSize:9, background:G.red, color:'#fff', borderRadius:3, padding:'1px 4px', fontWeight:700 }}>🏆{fuori.length}</span>}
                  {travel.length>0&&<span style={{ fontSize:9, background:G.blue, color:'#fff', borderRadius:3, padding:'1px 4px', fontWeight:700 }}>✈️{travel.length}</span>}
                </div>
                {/* Tornei */}
                {torneiDay.map(t=>(
                  <div key={t.id} style={{ fontSize:8, background:'#fef2f2', color:G.red, borderRadius:3, padding:'1px 4px', marginBottom:1, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🏆 {t.nome}</div>
                ))}
                {/* Maestri al centro (max 3) */}
                {centro.slice(0,3).map((m,mi)=>(
                  <div key={mi} style={{ fontSize:8, color:G.textMid, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.nome.split(' ')[0]}</div>
                ))}
                {centro.length>3&&<div style={{ fontSize:8, color:G.textLight }}>+{centro.length-3} altri</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── WeekBlock ─────────────────────────────────────────────────────────
function WeekBlock({ week, coaches, tornei, sectionName, onUpdate, onDelete, onAddRow, onDeleteRow }) {
  const { centro, torneo, travel, extra, tiroFuori } = calcCounters(week.rows)
  const monthIdx = MONTHS.indexOf(sectionName)
  let weekMon=null, weekSun=null
  if (monthIdx>=0) { weekMon=new Date(2026,monthIdx,week.num); weekSun=new Date(2026,monthIdx,week.num+6) }
  const torneiSett = weekMon ? tornei.filter(t=>{ const d=new Date(t.data); return d>=weekMon&&d<=weekSun }) : []

  return (
    <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${G.border}`, marginBottom:16, overflow:'hidden', boxShadow:'0 1px 6px rgba(26,107,60,0.07)' }}>
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
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:5 }}>
          <StatBar label="🏆 Torneo" color={G.red} values={torneo} />
          <StatBar label="✈️ Travelling" color={G.blue} values={travel} />
          <StatBar label="📋 Extra" color={G.purple} values={extra} />
          <StatBar label="👶 Tiro fuori" color={G.orange} values={tiroFuori} />
        </div>
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
  const [page, setPage] = useState('planner')
  const [sections, setSections] = useState(SECTIONS)
  const [active, setActive] = useState('s6')
  const [weeks, setWeeks] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [tornei, setTornei] = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const [flashSave, setFlashSave] = useState(false)

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

  function updateCoach(id, updated) { setCoaches(prev=>prev.map(c=>c.id===id?updated:c)) }
  function addCoach(coach) { setCoaches(prev=>[...prev,coach].sort((a,b)=>a.nome.localeCompare(b.nome))) }

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
    const ruolo=coachSupa&&coachSupa.ruolo?coachSupa.ruolo:newRuolo
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

        {/* Nav */}
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {[
            { key:'planner', label:'📋 Planner' },
            { key:'calendario', label:'📅 Calendario' },
            { key:'coach', label:'👤 Coach' },
          ].map(p=>(
            <button key={p.key} onClick={()=>setPage(p.key)} style={{ background:page===p.key?G.green:'transparent', color:page===p.key?'#fff':G.textMid, border:page===p.key?'none':`1.5px solid ${G.border}`, borderRadius:20, padding:'5px 12px', fontFamily:'inherit', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>{p.label}</button>
          ))}
          {/* Link sito tornei */}
          <a href={TORNEI_URL} target="_blank" rel="noopener noreferrer"
            style={{ background:'transparent', color:G.textMid, border:`1.5px solid ${G.border}`, borderRadius:20, padding:'5px 12px', fontFamily:'inherit', fontSize:11, fontWeight:600, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            🏆 Tornei ↗
          </a>
        </div>

        {/* Tabs mesi */}
        {page==='planner'&&(
          <div style={{ flex:1, display:'flex', gap:3, overflowX:'auto', scrollbarWidth:'none', padding:'3px 0' }}>
            {sections.map(s=>(
              <button key={s.id} onClick={()=>setActive(s.id)} style={{ background:s.id===active?G.green:'transparent', color:s.id===active?'#fff':G.textMid, border:s.id===active?'none':`1.5px solid ${G.border}`, borderRadius:20, padding:'4px 12px', fontFamily:'inherit', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>{s.name}</button>
            ))}
            <button onClick={()=>setModalSection(true)} style={{ background:'transparent', color:G.textLight, border:`1.5px dashed ${G.border}`, borderRadius:20, padding:'4px 10px', fontFamily:'inherit', fontSize:11, cursor:'pointer', flexShrink:0 }}>+</button>
          </div>
        )}
        {page!=='planner'&&<div style={{ flex:1 }}></div>}

        {/* Status */}
        <div style={{ fontSize:11, fontWeight:600, flexShrink:0, display:'flex', alignItems:'center', gap:5 }}>
          {syncStatus==='loading'&&<span style={{ color:G.textLight }}>⟳</span>}
          {syncStatus==='ok'&&<span style={{ color:G.green, fontSize:10 }}>🔗 {coaches.length}</span>}
          {syncStatus==='error'&&<button onClick={loadSupabase} style={{ color:G.red, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11 }}>⚠️</button>}
          <span style={{ color:flashSave?G.green:G.textLight, transition:'color .3s' }}>{flashSave?'✅':'💾'}</span>
        </div>
      </nav>

      {/* PAGES */}
      {page==='coach'&&<CoachPage coaches={coaches} weeks={weeks} sections={sections} onUpdateCoach={updateCoach} onAddCoach={addCoach} />}
      {page==='calendario'&&<CalendarioPage weeks={weeks} sections={sections} coaches={coaches} tornei={tornei} />}

      {page==='planner'&&(
        <div style={{ padding:20, maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:G.text, margin:0 }}>{activeSection?.name} 2026</h1>
              <p style={{ fontSize:13, color:G.textMid, margin:'3px 0 0' }}>{wks.length} settimane · {wks.reduce((s,w)=>s+w.rows.length,0)} maestri</p>
            </div>
            <button onClick={()=>setModalWeek(true)} style={{ background:G.green, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Settimana</button>
          </div>

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
              onUpdate={updateWeek} onDelete={()=>deleteWeek(week.id)}
              onAddRow={()=>openAddRow(week.id)} onDeleteRow={rowId=>deleteRow(week.id,rowId)} />
          ))}
        </div>
      )}

      {/* MODAL: Aggiungi Maestro */}
      <Modal open={!!modalRow} onClose={()=>setModalRow(null)} title="Aggiungi Maestro">
        <Field label="Scegli da lista coach">
          <FSelect value={newCoachId} onChange={v=>{ setNewCoachId(v); const c=coaches.find(c=>String(c.id)===v); if(c){setNewNome(c.nome); if(c.ruolo)setNewRuolo(c.ruolo)} }} options={[
            {value:'',label:'— seleziona coach —'},
            ...coaches.map(c=>({value:String(c.id),label:`${c.nome} · ${RUOLI.find(r=>r.key===c.ruolo)?.label||c.ruolo||''}`}))
          ]} />
        </Field>
        <Field label="oppure nome manuale">
          <FInput value={newNome} onChange={setNewNome} placeholder="Nome maestro" />
        </Field>
        <Field label="Ruolo">
          <FSelect value={newRuolo} onChange={setNewRuolo} options={[{value:'',label:'— seleziona —'},...RUOLI.map(r=>({value:r.key,label:r.label}))]} />
        </Field>
        <Field label="Impegno fuori centro">
          <FSelect value={newImpegno} onChange={setNewImpegno} options={[{value:'',label:'— al centro —'},...IMPEGNI.map(i=>({value:i.key,label:i.label}))]} />
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
        <Field label="Giorno iniziale (es. 1, 8, 15, 22, 29)">
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
