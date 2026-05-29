import './globals.css'

export const metadata = {
  title: 'PTC — Planner Maestri',
  description: 'Piatti Tennis Center — Gestione Maestri',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
