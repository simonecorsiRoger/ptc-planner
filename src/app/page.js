'use client'
import { useState } from 'react'
import { SECTIONS, DAYS, COLS, COL_KEYS, COUNTED_ROLES, uid, calcDays, buildInitialWeeks } from './data'

const G = {
  bg: '#f0faf0',
  border: '#d4e8d0',
  green: '#1a6b3c',
  greenLight: '#e8f5e9',
  greenMid: '#4caf50',
  text: '#1a2e1a',
  textMid: '#4a6741',
  textLight: '#8aaa85',
  red: '#e53935',
}

// ── Modal ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: 28,
        width: 440, maxWidth: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: G.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: G.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: G.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</div>
      {children}
    </div>
  )
}

function FInput({ value, onChange, placeholder, onKeyDown }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} onKeyDown={onKeyDown}
      style={{
        width: '100%', padding: '10px 12px', borderRadius: 8,
        border: `1.5px solid ${G.border}`, background: G.bg,
        fontSize: 13, color: G.text, outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box'
      }}
    />
  )
}

function FSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 12px', borderRadius: 8,
        border: `1.5px solid ${G.border}`, background: G.bg,
        fontSize: 13, color: G.text, outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box'
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Day checkboxes nel modale ─────────────────────────────────────────
function DayPicker({ selected, onChange }) {
  function toggle(i) {
    const next = [...selected]
    next[i] = !next[i]
    onChange(next)
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {DAYS.map((d, i) => (
        <button key={i} onClick={() => toggle(i)}
          style={{
            flex: 1, height: 40, borderRadius: 8,
            border: `2px solid ${selected[i] ? G.green : G.border}`,
            background: selected[i] ? G.green : '#fff',
            color: selected[i] ? '#fff' : G.textMid,
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all .15s'
          }}>{d}</button>
      ))}
    </div>
  )
}

// ── Week block ────────────────────────────────────────────────────────
function WeekBlock({ week, onUpdate, onDelete, onAddRow, onDeleteRow }) {
  // Ricalcola giorni automaticamente dai ruoli conteggiati
  const autoDays = calcDays(week.rows)

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: `1px solid ${G.border}`, marginBottom: 16,
      overflow: 'hidden', boxShadow: '0 1px 6px rgba(26,107,60,0.07)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        background: G.greenLight, borderBottom: `1px solid ${G.border}`,
        padding: '10px 16px'
      }}>
        {/* Numero settimana */}
        <div style={{
          width: 46, height: 46, borderRadius: 10, background: G.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0
        }}>{week.num}</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>
            Settimana {week.num}
            {week.note && <span style={{ fontWeight: 400, color: G.textMid, marginLeft: 8, fontSize: 12 }}>· {week.note}</span>}
          </div>
          <div style={{ fontSize: 11, color: G.textMid, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{week.rows.length} maestri</span>
            {week.rows.length > 0 && (
              <span style={{
                background: G.green, color: '#fff',
                borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700
              }}>
                Ø {(autoDays.reduce((a,b)=>a+b,0)/7).toFixed(1)} / giorno al centro
              </span>
            )}
          </div>
        </div>

        {/* Contatori giorni automatici */}
        <div style={{ display: 'flex', gap: 5 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: G.textLight, fontWeight: 700, marginBottom: 3 }}>{d}</div>
              <div style={{
                width: 32, height: 30, borderRadius: 6,
                background: autoDays[i] > 0 ? G.green : '#f0f4f0',
                color: autoDays[i] > 0 ? '#fff' : G.textLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800
              }}>{autoDays[i] || '—'}</div>
            </div>
          ))}
        </div>

        {/* Bottoni */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onAddRow} style={{
            background: '#fff', border: `1.5px solid ${G.green}`,
            color: G.green, borderRadius: 8, padding: '7px 14px',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>+ Maestro</button>
          <button onClick={onDelete} style={{
            background: '#fef2f2', border: `1.5px solid #fecaca`,
            color: G.red, borderRadius: 8, padding: '7px 10px',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>✕</button>
        </div>
      </div>

      {/* Tabella maestri */}
      {week.rows.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: G.textLight, fontSize: 13 }}>
          Nessun maestro — clicca <strong>+ Maestro</strong> per aggiungere
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={thStyle}>NOME</th>
                <th style={thStyle}>RUOLO</th>
                {DAYS.map((d, i) => (
                  <th key={i} style={{ ...thStyle, width: 36, textAlign: 'center' }}>{d}</th>
                ))}
                <th style={{ ...thStyle, width: 30 }}></th>
              </tr>
            </thead>
            <tbody>
              {week.rows.map((row, ri) => (
                <tr key={row.id} style={{ background: ri % 2 === 0 ? '#fff' : '#fafcfa' }}>
                  <td style={tdStyle}>
                    <input defaultValue={row.name}
                      onBlur={e => onUpdate({ ...week, rows: week.rows.map(r => r.id === row.id ? { ...r, name: e.target.value } : r) })}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, color: G.text, outline: 'none', fontFamily: 'inherit', width: '100%', padding: '2px 4px' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                      fontSize: 10, fontWeight: 700,
                      background: COUNTED_ROLES.includes(row.role) ? G.greenLight : '#f3f4f6',
                      color: COUNTED_ROLES.includes(row.role) ? G.green : G.textMid
                    }}>
                      {COLS.find(c => c.key === row.role)?.short || row.role}
                    </span>
                  </td>
                  {DAYS.map((d, di) => (
                    <td key={di} style={{ ...tdStyle, textAlign: 'center', padding: '4px' }}>
                      <button onClick={() => {
                        const newDays = [...row.days]
                        newDays[di] = !newDays[di]
                        onUpdate({ ...week, rows: week.rows.map(r => r.id === row.id ? { ...r, days: newDays } : r) })
                      }} style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: `1.5px solid ${row.days[di] ? G.green : G.border}`,
                        background: row.days[di] ? G.green : '#fff',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto', transition: 'all .1s'
                      }}>
                        {row.days[di] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </button>
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => onDeleteRow(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 14, padding: '2px 6px', borderRadius: 4 }}
                      onMouseEnter={e => e.target.style.color = G.red}
                      onMouseLeave={e => e.target.style.color = '#ddd'}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '7px 10px', background: '#f4faf4',
  borderBottom: `1px solid #d4e8d0`,
  fontSize: 10, fontWeight: 700, color: '#4a6741',
  textAlign: 'left', whiteSpace: 'nowrap'
}
const tdStyle = {
  padding: '5px 10px',
  borderBottom: `1px solid #f0f5f0`,
  verticalAlign: 'middle', fontSize: 13
}

// ── Main ──────────────────────────────────────────────────────────────
export default function Home() {
  const [sections, setSections] = useState(SECTIONS)
  const [active, setActive] = useState('s6')
  const [weeks, setWeeks] = useState(() => buildInitialWeeks())

  // Modal: aggiungi maestro
  const [modalRow, setModalRow] = useState(null) // weekId
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newDays, setNewDays] = useState([false,false,false,false,false,false,false])

  // Modal: aggiungi settimana
  const [modalWeek, setModalWeek] = useState(false)
  const [newWeekNum, setNewWeekNum] = useState('')
  const [newWeekNote, setNewWeekNote] = useState('')

  // Modal: aggiungi sezione
  const [modalSection, setModalSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')

  const wks = weeks[active] || []

  // Totali giornalieri: somma di tutti i contatori auto di tutte le settimane
  const totalDays = DAYS.map((_, di) =>
    wks.reduce((sum, w) => sum + calcDays(w.rows)[di], 0)
  )

  function setActiveWeeks(fn) {
    setWeeks(prev => ({ ...prev, [active]: typeof fn === 'function' ? fn(prev[active] || []) : fn }))
  }
  function updateWeek(updated) {
    setActiveWeeks(ws => ws.map(w => w.id === updated.id ? updated : w))
  }
  function deleteWeek(id) {
    setActiveWeeks(ws => ws.filter(w => w.id !== id))
  }
  function deleteRow(weekId, rowId) {
    setActiveWeeks(ws => ws.map(w => w.id === weekId
      ? { ...w, rows: w.rows.filter(r => r.id !== rowId) } : w
    ))
  }

  function openAddRow(weekId) {
    setModalRow(weekId)
    setNewName('')
    setNewRole('')
    setNewDays([false,false,false,false,false,false,false])
  }

  function confirmAddRow() {
    if (!newRole || !newName.trim()) return
    const row = {
      id: uid(),
      name: newName.trim(),
      role: newRole,
      days: newDays,
    }
    setActiveWeeks(ws => ws.map(w => w.id === modalRow
      ? { ...w, rows: [...w.rows, row] } : w
    ))
    setModalRow(null)
  }

  function confirmAddWeek() {
    const num = parseInt(newWeekNum) || ((wks.slice(-1)[0]?.num || 0) + 7)
    setActiveWeeks(ws => [...ws, {
      id: uid(), num, note: newWeekNote.trim(),
      rows: []
    }])
    setModalWeek(false)
    setNewWeekNum('')
    setNewWeekNote('')
  }

  function confirmAddSection() {
    if (!newSectionName.trim()) return
    const id = 'sx_' + uid()
    setSections(prev => [...prev, { id, name: newSectionName.trim() }])
    setWeeks(prev => ({ ...prev, [id]: [] }))
    setActive(id)
    setModalSection(false)
    setNewSectionName('')
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>

      {/* NAVBAR */}
      <nav style={{
        background: '#fff', borderBottom: `1px solid ${G.border}`,
        padding: '0 20px', height: 58,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 1px 6px rgba(26,107,60,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${G.green}, ${G.greenMid})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>🎾</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: G.green, letterSpacing: .5, lineHeight: 1.1 }}>PIATTI TENNIS CENTER</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: G.greenMid, letterSpacing: 1 }}>PLANNER MAESTRI</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 0' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              background: s.id === active ? G.green : 'transparent',
              color: s.id === active ? '#fff' : G.textMid,
              border: s.id === active ? 'none' : `1.5px solid ${G.border}`,
              borderRadius: 20, padding: '5px 16px',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0
            }}>{s.name}</button>
          ))}
          <button onClick={() => setModalSection(true)} style={{
            background: 'transparent', color: G.textLight,
            border: `1.5px dashed ${G.border}`, borderRadius: 20,
            padding: '5px 12px', fontFamily: 'inherit',
            fontSize: 12, cursor: 'pointer', flexShrink: 0
          }}>+ sezione</button>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>

        {/* Header pagina */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: G.text, margin: 0 }}>
              {sections.find(s => s.id === active)?.name} 2026
            </h1>
            <p style={{ fontSize: 13, color: G.textMid, margin: '3px 0 0' }}>
              {wks.length} settimane · {wks.reduce((s, w) => s + w.rows.length, 0)} maestri totali
            </p>
          </div>
          <button onClick={() => setModalWeek(true)} style={{
            background: G.green, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>+ Settimana</button>
        </div>

        {/* Barra totali */}
        <div style={{
          background: '#fff', border: `1px solid ${G.border}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(26,107,60,0.05)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.textMid, textTransform: 'uppercase', letterSpacing: .5, marginRight: 4 }}>
            Maestri al centro
          </span>
          {DAYS.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: G.greenLight, borderRadius: 20, padding: '4px 12px'
            }}>
              <span style={{ fontSize: 10, color: G.textMid, fontWeight: 600 }}>{d}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: G.green }}>{totalDays[i]}</span>
            </div>
          ))}
          <div style={{
            marginLeft: 'auto', background: G.green, color: '#fff',
            borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700
          }}>
            Media {(totalDays.reduce((a,b)=>a+b,0)/7).toFixed(1)} / giorno
          </div>
        </div>

        {/* Empty state */}
        {wks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: G.textLight }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Nessuna settimana</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clicca &ldquo;+ Settimana&rdquo; per iniziare</div>
          </div>
        )}

        {/* Settimane */}
        {wks.map(week => (
          <WeekBlock key={week.id} week={week}
            onUpdate={updateWeek}
            onDelete={() => deleteWeek(week.id)}
            onAddRow={() => openAddRow(week.id)}
            onDeleteRow={rowId => deleteRow(week.id, rowId)}
          />
        ))}
      </div>

      {/* MODAL: Aggiungi Maestro */}
      <Modal open={!!modalRow} onClose={() => setModalRow(null)} title="Aggiungi Maestro">
        <Field label="Nome">
          <FInput value={newName} onChange={setNewName} placeholder="Nome maestro"
            onKeyDown={e => e.key === 'Enter' && confirmAddRow()} />
        </Field>
        <Field label="Ruolo">
          <FSelect value={newRole} onChange={setNewRole} options={[
            { value: '', label: '— seleziona ruolo —' },
            ...COLS.map(c => ({ value: c.key, label: c.label }))
          ]} />
        </Field>
        <Field label="Giorni presenti questa settimana">
          <DayPicker selected={newDays} onChange={setNewDays} />
        </Field>
        {COUNTED_ROLES.includes(newRole) && (
          <div style={{
            background: G.greenLight, border: `1px solid ${G.border}`,
            borderRadius: 8, padding: '8px 12px', marginBottom: 16,
            fontSize: 12, color: G.textMid
          }}>
            ✅ Questo ruolo verrà conteggiato nel numero maestri al centro
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setModalRow(null)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddRow} disabled={!newName.trim() || !newRole} style={{
            background: newName.trim() && newRole ? G.green : '#ccc',
            color: '#fff', border: 'none', padding: '9px 18px',
            borderRadius: 8, fontFamily: 'inherit', fontSize: 13,
            fontWeight: 700, cursor: newName.trim() && newRole ? 'pointer' : 'not-allowed'
          }}>Aggiungi</button>
        </div>
      </Modal>

      {/* MODAL: Aggiungi Settimana */}
      <Modal open={modalWeek} onClose={() => setModalWeek(false)} title="Nuova Settimana">
        <Field label="Giorno iniziale del mese (es. 1, 8, 15, 22, 29)">
          <FInput value={newWeekNum} onChange={setNewWeekNum}
            placeholder={String((wks.slice(-1)[0]?.num || 0) + 7)}
            onKeyDown={e => e.key === 'Enter' && confirmAddWeek()} />
        </Field>
        <Field label="Nota (opzionale)">
          <FInput value={newWeekNote} onChange={setNewWeekNote} placeholder="es. Stage, Monte Carlo…" />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setModalWeek(false)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddWeek} style={{
            background: G.green, color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>Crea</button>
        </div>
      </Modal>

      {/* MODAL: Aggiungi Sezione */}
      <Modal open={modalSection} onClose={() => setModalSection(false)} title="Nuova Sezione">
        <Field label="Nome sezione">
          <FInput value={newSectionName} onChange={setNewSectionName} placeholder="es. Stage Invernale"
            onKeyDown={e => e.key === 'Enter' && confirmAddSection()} />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setModalSection(false)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddSection} style={{
            background: G.green, color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>Crea</button>
        </div>
      </Modal>
    </div>
  )
}
