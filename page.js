'use client'
import { useState } from 'react'
import { SECTIONS, DAYS, COLS, COL_KEYS, uid, mkRow, mkEmpty, avg7, buildInitialWeeks } from './data'

const G = {
  bg: '#f0faf0',
  card: '#ffffff',
  border: '#d4e8d0',
  green: '#1a6b3c',
  greenLight: '#e8f5e9',
  greenMid: '#4caf50',
  text: '#1a2e1a',
  textMid: '#4a6741',
  textLight: '#8aaa85',
  red: '#e53935',
}

// ── UI primitives ─────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: 28,
        width: 380, maxWidth: '92vw',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: G.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: G.textLight, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: G.textMid, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
      {children}
    </div>
  )
}

function FInput({ value, onChange, placeholder, onKeyDown }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} onKeyDown={onKeyDown}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
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
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1.5px solid ${G.border}`, background: G.bg,
        fontSize: 13, color: G.text, outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box'
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Week block ────────────────────────────────────────────────────────

function WeekBlock({ week, onUpdate, onDelete, onAddRow, onDeleteRow }) {
  const a = avg7(week.days)

  function updateDay(i, v) {
    const days = [...week.days]
    days[i] = v === '' ? 0 : Math.max(0, Math.min(99, Number(v)))
    onUpdate({ ...week, days })
  }

  function updateCell(rowId, col, val) {
    onUpdate({ ...week, rows: week.rows.map(r => r.id === rowId ? { ...r, [col]: val } : r) })
  }

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
        <div style={{
          width: 46, height: 46, borderRadius: 10,
          background: G.green, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0
        }}>{week.num}</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>
            Settimana {week.num}
            {week.note && (
              <span style={{ fontWeight: 400, color: G.textMid, marginLeft: 8, fontSize: 12 }}>
                · {week.note}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: G.textMid, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{week.rows.length} maestri</span>
            {a !== null && (
              <span style={{
                background: G.green, color: '#fff',
                borderRadius: 20, padding: '2px 8px',
                fontSize: 10, fontWeight: 700
              }}>Ø {a} / giorno al centro</span>
            )}
          </div>
        </div>

        {/* Day counters */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: G.textLight, fontWeight: 700, marginBottom: 2 }}>{d}</div>
              <input
                type="number" min={0} max={99}
                value={week.days[i] || ''}
                onChange={e => updateDay(i, e.target.value)}
                style={{
                  width: 32, height: 30, border: `1.5px solid ${G.border}`,
                  borderRadius: 6, textAlign: 'center', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 700, color: G.green,
                  background: '#fff', outline: 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onAddRow} style={{
            background: '#fff', border: `1.5px solid ${G.green}`,
            color: G.green, borderRadius: 8, padding: '6px 12px',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>+ Maestro</button>
          <button onClick={onDelete} style={{
            background: '#fef2f2', border: `1.5px solid #fecaca`,
            color: G.red, borderRadius: 8, padding: '6px 10px',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>✕</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{
                  padding: '6px 8px', background: '#f4faf4',
                  borderBottom: `1px solid ${G.border}`,
                  borderRight: `1px solid #eaf4ea`,
                  fontSize: 10, fontWeight: 700, color: G.textMid,
                  textAlign: 'left', whiteSpace: 'nowrap', letterSpacing: .3
                }}>{c.short}</th>
              ))}
              <th style={{
                padding: '6px 8px', background: '#f4faf4',
                borderBottom: `1px solid ${G.border}`,
                fontSize: 10, fontWeight: 700, color: G.textMid,
                textAlign: 'left', width: 90
              }}>NOTE</th>
              <th style={{ width: 30, background: '#f4faf4', borderBottom: `1px solid ${G.border}` }}></th>
            </tr>
          </thead>
          <tbody>
            {week.rows.map((row, ri) => (
              <tr key={row.id} style={{ background: ri % 2 === 0 ? '#fff' : '#fafcfa' }}>
                {COLS.map(c => (
                  <td key={c.key} style={{
                    padding: '3px 6px',
                    borderBottom: `1px solid #f0f5f0`,
                    borderRight: `1px solid #f0f5f0`,
                    verticalAlign: 'middle'
                  }}>
                    <input
                      defaultValue={row[c.key]}
                      onBlur={e => updateCell(row.id, c.key, e.target.value.trim())}
                      placeholder="—"
                      style={{
                        width: '100%', border: 'none', background: 'transparent',
                        fontSize: 12, color: row[c.key] ? G.text : '#ccc',
                        outline: 'none', fontFamily: 'inherit', padding: '2px 4px',
                        borderRadius: 4, minWidth: 70
                      }}
                      onFocus={e => { e.target.style.background = '#f0fdf0'; e.target.style.outline = `1px solid ${G.greenMid}` }}
                      onBlurCapture={e => { e.target.style.background = 'transparent'; e.target.style.outline = 'none' }}
                    />
                  </td>
                ))}
                <td style={{ padding: '3px 6px', borderBottom: `1px solid #f0f5f0`, verticalAlign: 'middle' }}>
                  {ri === 0 && (
                    <input
                      defaultValue={week.note}
                      onBlur={e => onUpdate({ ...week, note: e.target.value.trim() })}
                      placeholder="nota..."
                      style={{
                        width: '100%', border: 'none', background: 'transparent',
                        fontSize: 12, color: G.textMid, outline: 'none',
                        fontFamily: 'inherit', padding: '2px 4px', borderRadius: 4
                      }}
                      onFocus={e => { e.target.style.background = '#f0fdf0' }}
                      onBlurCapture={e => { e.target.style.background = 'transparent' }}
                    />
                  )}
                </td>
                <td style={{ textAlign: 'center', borderBottom: `1px solid #f0f5f0` }}>
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ddd', fontSize: 13, padding: '2px 6px', borderRadius: 4
                    }}
                    onMouseEnter={e => (e.target.style.color = G.red)}
                    onMouseLeave={e => (e.target.style.color = '#ddd')}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────

export default function Home() {
  const [sections, setSections] = useState(SECTIONS)
  const [active, setActive] = useState('s6')
  const [weeks, setWeeks] = useState(() => buildInitialWeeks())

  const [modalAddRow, setModalAddRow] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [newName, setNewName] = useState('')

  const [modalAddWeek, setModalAddWeek] = useState(false)
  const [newWeekNum, setNewWeekNum] = useState('')

  const [modalAddSection, setModalAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')

  const wks = weeks[active] || []
  const dayTotals = [0, 0, 0, 0, 0, 0, 0]
  wks.forEach(w => w.days.forEach((v, i) => (dayTotals[i] += Number(v) || 0)))
  const totalAvg = (dayTotals.reduce((a, b) => a + b, 0) / 7).toFixed(1)

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
      ? { ...w, rows: w.rows.filter(r => r.id !== rowId) }
      : w
    ))
  }

  function confirmAddRow() {
    if (!newRole) return
    const r = mkEmpty()
    r[newRole] = newName
    setActiveWeeks(ws => ws.map(w => w.id === modalAddRow
      ? { ...w, rows: [...w.rows, r] }
      : w
    ))
    setModalAddRow(null)
  }

  function confirmAddWeek() {
    const num = parseInt(newWeekNum) || ((wks.slice(-1)[0]?.num || 0) + 7)
    setActiveWeeks(ws => [...ws, { id: uid(), num, note: '', days: [0,0,0,0,0,0,0], rows: [mkEmpty()] }])
    setModalAddWeek(false)
    setNewWeekNum('')
  }

  function confirmAddSection() {
    if (!newSectionName.trim()) return
    const id = 's_' + uid()
    setSections(prev => [...prev, { id, name: newSectionName.trim() }])
    setActive(id)
    setModalAddSection(false)
    setNewSectionName('')
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: '#fff', borderBottom: `1px solid ${G.border}`,
        padding: '0 20px', height: 58,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 1px 6px rgba(26,107,60,0.07)'
      }}>
        {/* Logo */}
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

        {/* Tabs */}
        <div style={{
          flex: 1, display: 'flex', gap: 4, overflowX: 'auto',
          scrollbarWidth: 'none', padding: '4px 0'
        }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              background: s.id === active ? G.green : 'transparent',
              color: s.id === active ? '#fff' : G.textMid,
              border: s.id === active ? 'none' : `1.5px solid ${G.border}`,
              borderRadius: 20, padding: '5px 14px',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .15s', flexShrink: 0
            }}>{s.name}</button>
          ))}
          <button onClick={() => setModalAddSection(true)} style={{
            background: 'transparent', color: G.textLight,
            border: `1.5px dashed ${G.border}`, borderRadius: 20,
            padding: '5px 12px', fontFamily: 'inherit',
            fontSize: 12, cursor: 'pointer', flexShrink: 0
          }}>+ sezione</button>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: G.text, margin: 0 }}>
              {sections.find(s => s.id === active)?.name} 2026
            </h1>
            <p style={{ fontSize: 13, color: G.textMid, margin: '3px 0 0' }}>
              {wks.length} settimane · {wks.reduce((s, w) => s + w.rows.length, 0)} righe totali
            </p>
          </div>
          <button onClick={() => setModalAddWeek(true)} style={{
            background: G.green, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px',
            fontFamily: 'inherit', fontSize: 13,
            fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>+ Settimana</button>
        </div>

        {/* Totals bar */}
        <div style={{
          background: '#fff', border: `1px solid ${G.border}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(26,107,60,0.05)'
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: G.textMid,
            textTransform: 'uppercase', letterSpacing: .5, marginRight: 4
          }}>Maestri al centro</span>
          {DAYS.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: G.greenLight, borderRadius: 20, padding: '4px 12px'
            }}>
              <span style={{ fontSize: 10, color: G.textMid, fontWeight: 600 }}>{d}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: G.green }}>{dayTotals[i]}</span>
            </div>
          ))}
          <div style={{
            marginLeft: 'auto', background: G.green, color: '#fff',
            borderRadius: 20, padding: '4px 14px',
            fontSize: 12, fontWeight: 700
          }}>Media {totalAvg} / giorno</div>
        </div>

        {/* Empty state */}
        {wks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: G.textLight }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Nessuna settimana</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clicca &ldquo;+ Settimana&rdquo; per iniziare</div>
          </div>
        )}

        {/* Week blocks */}
        {wks.map(week => (
          <WeekBlock
            key={week.id}
            week={week}
            onUpdate={updateWeek}
            onDelete={() => deleteWeek(week.id)}
            onAddRow={() => { setModalAddRow(week.id); setNewRole(''); setNewName('') }}
            onDeleteRow={rowId => deleteRow(week.id, rowId)}
          />
        ))}
      </div>

      {/* ── MODAL: Add Maestro ── */}
      <Modal open={!!modalAddRow} onClose={() => setModalAddRow(null)} title="Aggiungi Maestro">
        <Field label="Ruolo">
          <FSelect value={newRole} onChange={setNewRole} options={[
            { value: '', label: '— seleziona —' },
            ...COLS.map(c => ({ value: c.key, label: c.label }))
          ]} />
        </Field>
        <Field label="Nome">
          <FInput value={newName} onChange={setNewName} placeholder="Nome maestro"
            onKeyDown={e => e.key === 'Enter' && confirmAddRow()} />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={() => setModalAddRow(null)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddRow} style={{
            background: G.green, color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>Aggiungi</button>
        </div>
      </Modal>

      {/* ── MODAL: Add Settimana ── */}
      <Modal open={modalAddWeek} onClose={() => setModalAddWeek(false)} title="Nuova Settimana">
        <Field label="Giorno iniziale (es. 1, 8, 15, 22, 29)">
          <FInput value={newWeekNum} onChange={setNewWeekNum}
            placeholder={String((wks.slice(-1)[0]?.num || 0) + 7)}
            onKeyDown={e => e.key === 'Enter' && confirmAddWeek()} />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={() => setModalAddWeek(false)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddWeek} style={{
            background: G.green, color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>Crea</button>
        </div>
      </Modal>

      {/* ── MODAL: Add Sezione ── */}
      <Modal open={modalAddSection} onClose={() => setModalAddSection(false)} title="Nuova Sezione">
        <Field label="Nome sezione">
          <FInput value={newSectionName} onChange={setNewSectionName} placeholder="es. Stage Invernale"
            onKeyDown={e => e.key === 'Enter' && confirmAddSection()} />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={() => setModalAddSection(false)} style={{
            background: 'transparent', color: G.textMid, border: `1.5px solid ${G.border}`,
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
          }}>Annulla</button>
          <button onClick={confirmAddSection} style={{
            background: G.green, color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>Crea</button>
        </div>
      </Modal>

    </div>
  )
}
