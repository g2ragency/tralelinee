# HANDOFF — punto di partenza per una nuova sessione

Leggi questo file per primo, poi `PLANNING.md` e `DISCOVERY.md`. Contengono tutto il contesto: non serve rifare la Discovery.

## In una riga
Rifacimento 1:1 in **Next.js** del sito one-pager `tralelinee.com` (oggi WP/Elementor), a partire dal **Figma definitivo** `eEsO9qVT3E4FKjb0nIVkbk` frame `1230:2206`, con animazioni migliorate (GSAP+ScrollTrigger+Lenis, niente jQuery/Bootstrap/Swiper), più nuove feature: account utenti, portfolio riservato, theming, super admin. Backend **Supabase**, deploy **Vercel**.

## Decisioni GIÀ prese (non ridiscutere)
- **Framework**: Next.js App Router + TypeScript + Tailwind + CSS variables.
- **Backend**: Supabase (auth, Postgres, storage, RLS).
- **Conferma utenti**: approvazione manuale del super admin **+ whitelist di email** auto-approvate alla registrazione.
- **Cambio colore**: bottone **sticky in basso a destra**, cambia **solo la palette** (dark↔light), crossfade 300ms. Il meccanismo esiste già nel sito attuale (vedi DISCOVERY §Dettaglio fine animazioni).
- **Deploy**: Vercel, team "Seedera's projects" (`team_bqrFLk605izLvm0ZRHjRQm70`). Progetto Vercel da creare a scaffold pronto.
- Il vecchio wp-content è solo **materiale di studio** (branch `reference/wp-content`), NON da copiare: le animazioni vanno migliorate e riscritte pulite in React.

## Decisioni APERTE (chiedere al cliente)
- **Font ABC Diatype**: il sito usa i file "Trial" **non licenziati**. Serve licenza (ABC Dinamo) o sostituto libero simile. Testi mono = DM Mono (libero, ok).
- **Sfondo sezione Capabilities**: nel Figma il frame di sfondo è `hidden` — confermare resa.
- Progetto Supabase: crearne uno nuovo o usarne uno esistente.

## Branch del repo
- `main` — solo README, vuoto.
- `claude/wp-to-react-migration-26jdif` — **branch di lavoro** (planning + sviluppo). Sviluppa qui.
- `reference/wp-content` — dump del wp-content originale (145MB: `themes/themebase`, `plugins/elementor_addons`, `uploads/`). Materiale di studio.

## ⚠️ Trucchi d'ambiente (una sessione nuova ci sbatte la testa senza queste note)

### 1. Il browser headless NON raggiunge il sito live dal cloud
`page.goto('https://tralelinee.com')` fallisce con `net::ERR_CONNECTION_RESET` (il proxy egress resetta il TLS del browser Chromium, mentre `curl` funziona). **Soluzione**: renderizzare un **mirror locale** del sito servito da `_reference/`.

Ricetta mirror (già usata, ricostruibile):
1. `curl` la home del live in HTML, riscrivere i path `https://tralelinee.com/wp-content` → `/wp-content`, servire `_reference/wp-content` come document root (symlink o worktree del branch `reference/wp-content`).
2. Scaricare le lib CDN (gsap, scrolltrigger, lenis, swiper, split-type) e i font Google in locale, riscrivere gli URL nell'HTML.
3. `python3 -m http.server 8765` nella cartella mirror.
4. Playwright si connette a `http://127.0.0.1:8765/`.

### 2. Playwright / Chromium
- Chromium preinstallato: `executablePath: '/opt/pw-browsers/chromium'` (NON lanciare `playwright install`).
- `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` + `npm install playwright --no-save` nella scratchpad.
- Per il mirror su localhost il proxy non serve; per URL esterni il browser comunque fallisce (usa il mirror).

### 3. Figma
- MCP autenticato come **ercole.sarno@gmail.com**. Il file è condiviso, accesso ok.
- File **definitivo**: `eEsO9qVT3E4FKjb0nIVkbk`. Un file precedente `QwGdZTf07cR2rAKowcAeYj` esiste con struttura identica → **non usarlo**.
- Screenshot full-res: `get_screenshot` con `maxDimension` alto (fino a 10339), poi ritagliare a fette con Pillow per leggerle.

### 4. Git push (potrebbe funzionare o no in sessione nuova)
In QUESTA sessione il push era bloccato (403 "Resource not accessible by integration") pur avendo `can_push:true` da list_repos — problema di credenziali della *singola sessione cloud*, non del repo. Una sessione nuova dovrebbe avere credenziali corrette (come su `g2ragency/academy`). Se il push fallisce ancora: committare in locale e passare i commit all'utente via `git bundle` (l'utente pusha dal suo PC, dove funziona).

## Primi passi consigliati (fase Fondamenta)
1. Scaffold `create-next-app` (App Router, TS, Tailwind, ESLint) sul branch di lavoro.
2. Design token in `globals.css` / `tailwind.config`: `--black #000`, `--white #DFDFDF`, `--grey #696969`; tema dark default + light via `[data-theme]`.
3. Font: setup `@font-face` (Diatype, in attesa decisione licenza — intanto placeholder) + DM Mono via `next/font`.
4. Layout base: `ThemeProvider` (cookie/localStorage, no-flash SSR), `<CustomCursor>`, `<SmoothScroll>` (Lenis), header, footer, bottone tema sticky.
5. Homepage sezione per sezione seguendo `DISCOVERY.md §Struttura sezioni` e §Inventario contenuti, confrontando con gli screenshot Figma.
6. Animazioni A2–A8 con i timing esatti del catalogo.
7. Supabase: schema `profiles` / `approved_emails` / `portfolio_sections` + RLS (vedi PLANNING).
8. Auth + portfolio + area super admin.

## Riferimenti rapidi
- Palette: nero `#000000`, off-white `#DFDFDF`, grigio `#696969`.
- Breakpoint mobile Figma: 390px. Menu inline desktop sopra `xl`, hamburger/offcanvas sotto.
- Contatti: Viale Parioli 39c - Roma · info@tralelinee.com · +39 332 435 3480.
