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

export function mkRow(role, name) {
  const r = { id: uid() }
  COL_KEYS.forEach(k => (r[k] = ''))
  r[role] = name
  return r
}

export function mkEmpty() {
  const r = { id: uid() }
  COL_KEYS.forEach(k => (r[k] = ''))
  return r
}

export function avg7(days) {
  const s = days.reduce((a, b) => a + Number(b), 0)
  return s > 0 ? Math.round(s / 7) : null
}

export function buildInitialWeeks() {
  return {
    s0: [{
      id: uid(), num: 1, note: 'Stage residenziale', days: [15,15,15,15,15,15,15],
      rows: [
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'), mkRow('coach','Corsi'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'), mkRow('asst','Cella'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Salvi'), mkRow('travel','Lagati'), mkRow('travel','Turati'),
        mkRow('extra','Stage residenziale Elba'), mkRow('video','Fossi'),
      ],
    }],
    s1: [
      { id:uid(), num:5, note:'Rientro', days:[11,11,11,11,11,9,9], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('tiro','Yasmine'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Rientro anno nuovo'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:12, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Federico'), mkRow('coach','Corsi'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Michele'),
        mkRow('travel','Salvi Australia'), mkRow('extra','Australian Open prep'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:19, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Salvi'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Torneo gennaio'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:26, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Prep febbraio'), mkRow('video','Fossi'),
      ]},
    ],
    s2: [
      { id:uid(), num:2, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Fabbiano'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Salvi'), mkRow('extra','Torneo indoor'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:9, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Federico'), mkRow('coach','Corsi'), mkRow('coach','Carrassi'),
        mkRow('asst','Marinoni'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Torneo febbraio'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:16, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Cella'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Carnevale'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:23, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Marinoni'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('extra','Prep marzo'), mkRow('video','Fossi'),
      ]},
    ],
    s3: [
      { id:uid(), num:2, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Salvi Indian Wells'), mkRow('extra','Indian Wells prep'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:9, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Corsi'), mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Lascia A'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati Miami'), mkRow('extra','Miami prep'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:16, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Marinoni'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Torneo marzo'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:23, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Prep aprile'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:30, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Corsi'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Salvi'), mkRow('extra','Tornei terra rossa'), mkRow('video','Fossi'),
      ]},
    ],
    s4: [
      { id:uid(), num:6, note:'Monte Carlo', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Marinoni'), mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Salvi Monte Carlo'), mkRow('extra','Monte Carlo prep'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:13, note:'Barcellona', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Corsi'), mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Lascia A'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati Barcellona'), mkRow('extra','Torneo terra rossa'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:20, note:'Madrid', days:[12,12,12,12,12,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('travel','Turati Madrid'), mkRow('extra','Madrid Masters'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:27, note:'Roma', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Saccomani Roma'), mkRow('extra','Internazionali Roma'), mkRow('video','Fossi'),
      ]},
    ],
    s5: [
      { id:uid(), num:4, note:'RG prep', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Salvi RG'), mkRow('extra','Roland Garros prep'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:11, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Corsi'), mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati'), mkRow('extra','Torneo maggio'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:18, note:'Roland Garros', days:[13,13,13,13,13,11,11], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Marinoni'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('travel','Turati RG'), mkRow('extra','Roland Garros'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:25, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Salvi'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Prep Giugno'), mkRow('video','Fossi'),
      ]},
    ],
    s6: [
      { id:uid(), num:1, note:'Stage 6-7', days:[12,12,12,11,11,8,8], rows:[
        mkRow('elite','Andrea'), mkRow('head','Grigelis'), mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Marinoni'), mkRow('asst','Bella'), mkRow('asst','Michele'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Paoletti'), mkRow('tiro','Lagati'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Mirko'),
        mkRow('travel','Ispas Rep Cieca u14'), mkRow('travel','Caltanissetta (Stephane)'), mkRow('travel','Salvi avverine'),
        mkRow('extra','Cella off 1-4 poi torneo'), mkRow('extra','Ivaldi 1-5 ft'), mkRow('extra','Carrassi 1-5 ft'), mkRow('extra','Fabbiano off'),
        mkRow('video','Fossi'), mkRow('tiro','Turati'),
      ]},
      { id:uid(), num:8, note:'', days:[12,13,13,13,13,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'), mkRow('coach','Fabbiano no 8-9'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Lagati'),
        mkRow('tiro','Girasole?'), mkRow('tiro','Lascia A no 8'), mkRow('tiro','Carrassi'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Marocco (30 Salvi Cella)'), mkRow('travel','Ispas Rep Cieca u14'), mkRow('travel','Nizza 35'), mkRow('travel','Monastir grigelis'), mkRow('travel','Messina (Stephane)'),
        mkRow('extra','Anagni 13-14 Stage'), mkRow('extra','Ivaldi off?'), mkRow('extra','Paoletti 12-19 off'),
        mkRow('video','Fossi'), mkRow('tiro','Turati'),
      ]},
      { id:uid(), num:15, note:'', days:[13,13,13,13,13,13,13], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Di Nocera'), mkRow('asst','Paoletti dal 20'),
        mkRow('tiro','Girasole?'), mkRow('tiro','Lascia A no 8'), mkRow('tiro','Yasmine dal 18'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Marocco (30 Salvi Cella)'), mkRow('travel','Milano grigelis'), mkRow('travel','Monastir Riccardo'), mkRow('travel','Lagati Germania 200'),
        mkRow('extra','Ivaldi tirocinio fit'), mkRow('extra','Carrassi tirocinio fit'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:22, note:'', days:[11,11,11,10,10,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Corsi'), mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Di Nocera'), mkRow('asst','Dalla Lucia'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'), mkRow('asst','Turati 22-23-28'),
        mkRow('tiro','Ipas'), mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Cella'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati Germania 100'), mkRow('travel','Bergamo (Maggio)'),
        mkRow('extra','Grigelis Off'), mkRow('extra','Turati off 24-27 Filip'), mkRow('extra','Lagati off 24-25-26??'),
        mkRow('video','Fossi'),
      ]},
      { id:uid(), num:29, note:'', days:[12,12,12,12,12,12,12], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Di Nocera'), mkRow('asst','Dalla Lucia'), mkRow('asst','Ivaldi'), mkRow('asst','Lagati'), mkRow('asst','Salvi'),
        mkRow('tiro','Grygelis'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Serbia Turati'), mkRow('travel','Corsi Sud Africa'), mkRow('travel','Ch Milano?'),
        mkRow('extra','Vanni torneo'), mkRow('video','Fossi'),
      ]},
    ],
    s7: [
      { id:uid(), num:6, note:'Stage estivo', days:[14,14,14,14,14,12,12], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Marinoni'), mkRow('asst','Bella'), mkRow('asst','Michele'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Mirko'),
        mkRow('travel','Ispas'), mkRow('travel','Salvi'),
        mkRow('extra','Stage Luglio 6-12'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:13, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Fabbiano'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Marocco Salvi'), mkRow('travel','Germania Lagati'),
        mkRow('extra','Ivaldi ft'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:20, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Corsi'), mkRow('coach','Carrassi'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Girasole'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Nizza Turati'), mkRow('extra','Grigelis off'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:27, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Di Nocera'), mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Marinoni'), mkRow('asst','Cella'), mkRow('asst','Salvi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Corsi Africa'), mkRow('extra','Stage fine luglio'), mkRow('video','Fossi'),
      ]},
    ],
    s8: [
      { id:uid(), num:3, note:'', days:[10,10,10,10,10,8,8], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('physical','Drago'), mkRow('physical','Michele'),
        mkRow('travel','Ispas'), mkRow('extra','Prep settembre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:10, note:'Ferragosto', days:[8,8,8,0,0,0,0], rows:[
        mkRow('head','Niccolò'), mkRow('coach','Di Nocera'),
        mkRow('asst','Cella'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('extra','Ridotta presenza'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:17, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Corsi'), mkRow('coach','Fabbiano'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Mirko'),
        mkRow('travel','Salvi US Open'), mkRow('extra','Prep autunno'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:24, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati'), mkRow('extra','Tornei fine agosto'), mkRow('video','Fossi'),
      ]},
    ],
    s9: [
      { id:uid(), num:7, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Corsi'),
        mkRow('asst','Marinoni'), mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Ispas'), mkRow('travel','Salvi'),
        mkRow('extra','Rientro autunno'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:14, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Bella'), mkRow('asst','Cella'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Lagati'), mkRow('extra','Torneo settembre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:21, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Di Nocera'), mkRow('coach','Corsi'), mkRow('coach','Carrassi'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Salvi'),
        mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Michele'),
        mkRow('extra','Grigelis off'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:28, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Saccomani'), mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Marinoni'), mkRow('asst','Cella'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Ipas'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Mirko'),
        mkRow('travel','Ispas Rep'), mkRow('extra','Prep ottobre'), mkRow('video','Fossi'),
      ]},
    ],
    s10: [
      { id:uid(), num:5, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Marinoni'), mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Salvi'), mkRow('extra','Stage ottobre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:12, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Corsi'), mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Lascia A'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('travel','Marocco'), mkRow('extra','Torneo ottobre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:19, note:'', days:[13,13,13,13,13,11,11], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Federico'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'), mkRow('asst','Marinoni'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'), mkRow('physical','Michele'),
        mkRow('travel','Ispas'), mkRow('extra','Ivaldi ft'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:26, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Fabbiano'), mkRow('coach','Carrassi'),
        mkRow('asst','Cella'), mkRow('asst','Salvi'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Prep novembre'), mkRow('video','Fossi'),
      ]},
    ],
    s11: [
      { id:uid(), num:2, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('travel','Salvi'), mkRow('extra','Tornei novembre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:9, note:'', days:[12,12,12,12,12,10,10], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Federico'), mkRow('coach','Corsi'), mkRow('coach','Fabbiano'),
        mkRow('asst','Cella'), mkRow('asst','Ivaldi'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('tiro','Paoletti'),
        mkRow('physical','Drago'), mkRow('physical','Michele'), mkRow('physical','Mirko'),
        mkRow('extra','Torneo indoor'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:16, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'), mkRow('coach','Carrassi'),
        mkRow('asst','Bella'), mkRow('asst','Dalla Lucia'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Grigelis off'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:23, note:'', days:[10,10,10,10,10,8,8], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'),
        mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Cella'), mkRow('asst','Salvi'), mkRow('asst','Ivaldi'),
        mkRow('tiro','Ipas'), mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Prep dicembre'), mkRow('video','Fossi'),
      ]},
    ],
    s12: [
      { id:uid(), num:7, note:'', days:[11,11,11,11,11,9,9], rows:[
        mkRow('elite','Andrea'), mkRow('head','Niccolò'), mkRow('head','Stephane'),
        mkRow('coach','Saccomani'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('asst','Marinoni'),
        mkRow('tiro','Yasmine'), mkRow('tiro','Girasole'),
        mkRow('physical','Drago'), mkRow('physical','Leandro'),
        mkRow('extra','Stage dicembre'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:14, note:'', days:[10,10,10,10,10,8,8], rows:[
        mkRow('head','Niccolò'), mkRow('coach','Federico'), mkRow('coach','Fabbiano'),
        mkRow('asst','Cella'), mkRow('asst','Salvi'),
        mkRow('tiro','Ipas'), mkRow('physical','Drago'), mkRow('physical','Mirko'),
        mkRow('extra','Pre-Natale'), mkRow('video','Fossi'),
      ]},
      { id:uid(), num:21, note:'Natale', days:[6,6,6,0,0,0,0], rows:[
        mkRow('head','Niccolò'), mkRow('coach','Di Nocera'),
        mkRow('asst','Bella'), mkRow('physical','Drago'),
        mkRow('extra','Chiusura natalizia'),
      ]},
    ],
  }
}
