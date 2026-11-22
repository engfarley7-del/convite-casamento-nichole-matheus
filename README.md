# Convite de Casamento — Nichole & Matheus

Site React (Vite) hospedado na Netlify. A API (confirmação de presença, presentes, admin e fotos) roda em uma Netlify Function (`netlify/functions/api.mts`) e guarda os dados no Netlify Blobs. Os dados iniciais ficam em `netlify/seed/wedding_data.json`.

## Variáveis de ambiente (Netlify)
- `ADMIN_USERNAME` e `ADMIN_PASSWORD`: login do painel de administração (escopo Functions).

## Desenvolvimento
`npm install` e `npm run dev` (usa o Netlify CLI).
