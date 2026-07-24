# Tralelinee — Migrazione WP/Elementor → React

Clone 1:1 del sito esistente (WP/Elementor) in React, con parità totale di stili e animazioni (desktop + mobile da Figma), più nuove funzionalità: account utenti, portfolio riservato con contenuti dinamici, theming e area super admin.

## Stack

| Livello | Scelta | Note |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG per le pagine pubbliche, middleware per auth, deploy nativo su Vercel |
| Styling | **Tailwind CSS + CSS variables** | Design token estratti dal Figma; il theming passa interamente dalle variabili |
| Backend | **Supabase** | Auth, Postgres (contenuti dinamici), Storage (media), RLS per i ruoli |
| Animazioni | Da definire in Discovery | GSAP/ScrollTrigger, Framer Motion o CSS puro — scelta basata sull'inventario delle animazioni del sito live |
| Hosting | **Vercel** | |

## Decisioni prese

- **Framework**: Next.js App Router (confermato).
- **Conferma utenti**: approvazione **manuale** da parte del super admin, **più una whitelist di email** che vengono approvate automaticamente al momento della registrazione.
- **Cambio colore**: bottone sticky in basso a destra, cambia **solo la palette** (nessuna variazione di contenuti). Implementazione: temi come set di CSS variables, persistenza della scelta (localStorage/cookie).

## Ruoli e permessi

| Ruolo | Accesso |
|---|---|
| Visitatore | Sito pubblico (clone 1:1) |
| Utente registrato (non approvato) | Sito pubblico + stato "in attesa di approvazione" |
| Utente approvato | + pagina **Portfolio** |
| Super admin | + area admin: gestione utenti (approva/revoca, whitelist email) e editing contenuti dinamici del portfolio |

Implementazione: Supabase Auth + tabella `profiles` (ruolo, stato approvazione) + tabella `approved_emails` (whitelist) + trigger alla registrazione per l'auto-approvazione + RLS su tutte le tabelle di contenuto.

## Schema dati (bozza, da raffinare)

- `profiles` — id (fk auth.users), email, role (`user` | `super_admin`), approved (bool), created_at
- `approved_emails` — email whitelisted per auto-approvazione
- `portfolio_sections` — sezioni della pagina portfolio: tipo, ordine, contenuto (jsonb), visibile
- Storage bucket `portfolio-media` per immagini/video caricati dall'admin

## Fasi di lavoro

1. **Discovery** — inventario completo del sito live (pagine, sezioni, componenti, breakpoint, animazioni con trigger e timing) e del Figma (desktop + mobile). Output: checklist di parità 1:1.
2. **Fondamenta** — scaffold Next.js + Tailwind, design token dal Figma, sistema di theming (CSS variables + bottone sticky), layout base (header/footer/nav), progetto Supabase.
3. **Clone sito pubblico** — pagina per pagina, verifica visiva comparativa (screenshot Playwright vs Figma/sito live, desktop e mobile).
4. **Animazioni** — replica fedele di ogni animazione catalogata in Discovery.
5. **Auth + Portfolio** — registrazione, login, flusso approvazione (manuale + whitelist), pagina portfolio con sezioni dinamiche da Supabase.
6. **Super admin** — gestione utenti e whitelist, editor dei contenuti dinamici del portfolio.
7. **QA + deploy** — confronto finale 1:1, audit RLS/security, deploy su Vercel.

## Input necessari

- [ ] URL del sito live (WP/Elementor)
- [ ] Link al file Figma (desktop + mobile)
- [ ] Progetto Supabase: usarne uno esistente o crearne uno nuovo?
- [ ] Dominio/progetto Vercel di destinazione
