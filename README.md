# PTC Planner Maestri

Piatti Tennis Center — Gestione Maestri settimanale.

## 🚀 Deploy su Vercel (5 minuti)

### Metodo 1 — Drag & Drop (più semplice)

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca **"Add New Project"**
3. Trascina questa cartella (`ptc-planner`) nella finestra
4. Clicca **"Deploy"**
5. Attendi ~60 secondi → il sito è online!

### Metodo 2 — GitHub (consigliato per aggiornamenti)

1. Crea un repo su [github.com](https://github.com) e carica questa cartella
2. Vai su [vercel.com](https://vercel.com) → **"Add New Project"**
3. Connetti il repo GitHub
4. Clicca **"Deploy"**

---

## 💻 Sviluppo locale

```bash
npm install
npm run dev
# Apri http://localhost:3000
```

## 📁 Struttura

```
ptc-planner/
├── src/app/
│   ├── page.js        ← componente principale
│   ├── data.js        ← dati iniziali e helper
│   ├── layout.js      ← layout Next.js
│   └── globals.css    ← stili globali
├── package.json
└── next.config.js
```

## ✏️ Modificare i dati

Per aggiornare i maestri di default, modifica `src/app/data.js` nella funzione `buildInitialWeeks()`.
