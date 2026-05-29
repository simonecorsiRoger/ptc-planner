export const COLS = [
  { key: 'elite',    label: 'ÉLITE COACH',       short: 'Élite' },
  { key: 'head',     label: 'HEAD COACH',         short: 'Head' },
  { key: 'coach',    label: 'COACH',              short: 'Coach' },
  { key: 'asst',     label: 'ASSISTANT COACH',    short: 'Asst.' },
  { key: 'tiro',     label: 'TIROCINANTI',        short: 'Tiro' },
  { key: 'physical', label: 'PHYSICAL TRAINER',   short: 'Phys.' },
  { key: 'travel',   label: 'TRAVELLING COACH',   short: 'Travel' },
  { key: 'video',    label: 'VIDEO/FISIO/MENTAL', short: 'Video' },
  { key: 'extra',    label: 'EXTRA PROGRAM',      short: 'Extra' },
]
export const COUNTED_ROLES = ['head', 'coach', 'asst', 'tiro']
export const DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
export const COL_KEYS = COLS.map(c => c.key)
export const SECTIONS = [
  { id: 's0',  name: 'Stage Elba' },
  { id: 's1',  name: 'Gennaio' },
  { id: 's2',  name: 'Febbraio' },
  { id: 's3',  name: 'Marzo' },
  { id: 's4',  name: 'Aprile' },
  { id: 's5',  name: 'Maggio' },
  { id: 's6',  name: 'Giugno' },
  { id: 's7',  name: 'Luglio' },
  { id: 's8',  name: 'Agosto' },
  { id: 's9',  name: 'Settembre' },
  { id: 's10', name: 'Ottobre' },
  { id: 's11', name: 'Novembre' },
  { id: 's12', name: 'Dicembre' },
]
let _id = 1
export function uid() { return 'id' + (_id++) + '_' + Math.random().toString(36).slice(2, 6) }
export function calcDays(rows) {
  return DAYS.map((_, di) =>
    rows.filter(r => COUNTED_ROLES.includes(r.role) && r.days[di]).length
  )
}
export function buildInitialWeeks() {
  const empty = {}
  SECTIONS.forEach(s => { empty[s.id] = [] })
  return empty
}
