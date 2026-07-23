# Discovery — Inventario sito live + Figma

Stato: prima passata completa. Manca solo l'analisi di `themes/` e `uploads/` (in attesa di push su `reference/wp-content`).

## Sito live (tralelinee.com)

**One-pager** con ancore: `#chi-siamo`, `#metodo`, `#capabilities`, `#contatti` (+ Privacy Policy come pagina separata).

### Stack tecnico attuale
- WP + Elementor + tema custom `themebase`/`themebasejs`
- GSAP 3.12 + ScrollTrigger (CDN)
- Lenis smooth scroll (`@studio-freight/lenis`)
- Swiper 11 (caricato; usato dal widget partners come marquee CSS)
- MorphSVGPlugin (GSAP) per il logo
- Bootstrap (accordion/collapse + offcanvas menu mobile)
- Contact Form 7, Cookie Law Info, Google Site Kit

### Il theme switcher ESISTE GIÀ (`main.js` del tema)
- Bottoni `#theme-switcher` (desktop) e `#theme-switcher-mobile`
- Toggle classi `dark-theme`/`light-theme` sul body, persistenza in `localStorage`
- Testo bottone: "Light" quando è attivo il dark, "Dark" quando è attivo il light
- Swap del logo (versione bianca/nera) al cambio tema
- Default: dark-theme
- → La feature "cambio colore" richiesta è la **replica** di questa, non una novità

### Design token (dal CSS del tema)
- `--black: #000000`, `--white: #DFDFDF` (non bianco puro!), `--grey: #696969`
- Dark: `--bg-color: var(--black)`, `--text-color: var(--white)`; light: invertiti
- Conferma dal Figma: BIANCO `#DFDFDF`, GRIGIO1 `#696969`

### ⚠️ Font — problema di licenza
- Titoli: **ABC Diatype "Trial"** (Light/Regular/Medium/Heavy/Bold, woff self-hosted) — è la versione **trial non licenziata** di un font commerciale (ABC Dinamo). Da decidere: acquistare licenza o sostituire con font simile libero.
- Testi mono: **DM Mono** (Google Fonts) — ok, libero.
- H1 da Figma: Diatype Regular 86px, line-height 1, letter-spacing -4.

## Catalogo animazioni (da replicare 1:1)

| # | Animazione | Sorgente | Meccanica esatta |
|---|---|---|---|
| A1 | Smooth scroll globale | app.js (da confermare) | Lenis, `window.lenis`, scrollTo con duration 1.5 |
| A2 | Cursore custom | main.js | Dot 0.3rem che segue il mouse + ombra ad anello con lerp 0.1 (rAF); su hover di link/bottoni: cresce a 6rem, colore invertito rispetto al tema, opacity 0.7; nel footer e aree scure forzato bianco |
| A3 | Chi Siamo — scroll orizzontale | widget `slides-horizontal` | Sezione pinnata, `gsap.to(x: -scrollLength)` scrub, end dinamico = larghezza contenuto; contatore fisso "n/4" aggiornato con `containerAnimation` trigger a `left center`; contatore visibile solo durante il pin |
| A4 | Capabilities — digit sticky 01→06 | widget `expand-digit-accordian` | ScrollTrigger pin del numero gigante (start `top top+=100`, end `bottom center`, pinSpacing false); visibilità solo dentro la sezione; `numberText` cambia a ogni sezione (trigger `top`); nav interna con smooth scrollTo compensato dall'altezza sticky +30px |
| A5 | Capabilities — accordion interni | widget `expand-digit-accordian` | Bootstrap collapse (un solo aperto per sezione, `data-bs-parent`) |
| A6 | Metodo — accordion hover | widget `expand-accordion` | Su mouseover: `max-height` 0→scrollHeight, opacity 0→1, padding animato; linea verticale `scaleY` proporzionale ad altezza contenuto (base 58px) |
| A7 | Logo header "T\|L\|L" espandibile | widget `expand-logo` + main.js | mouseenter: `rest` (RA/E/INEE) opacity 0→1 e x -10→0 (0.3s power2.out), separatore destro x+30; mouseleave inverso (power2.inOut); + `.logo-reveal` con width 0→auto 0.8s |
| A8 | Marquee partner | widget `swiper-partners` | Nastro CSS infinito: loghi duplicati ×2, durata = larghezza/velocità (80 px/s desktop, 130 mobile), CSS custom properties `--marquee-distance`/`--marquee-duration` |
| A9 | Logo morph (MorphSVGPlugin) | expand-logo/app.js | Da confermare all'arrivo di app.js — MorphSVG caricato ma logica nel tema |
| A10 | Hero / sfumature / reveal testi | app.js | Da catalogare all'arrivo di `themes/` (app.js bloccato via download diretto: il server restituisce HTML) |

## Figma — file DEFINITIVO: `eEsO9qVT3E4FKjb0nIVkbk`

(Il file QwGdZTf07cR2rAKowcAeYj era una versione precedente con struttura identica — non usarlo.)

| Frame | Node | Dim | Note |
|---|---|---|---|
| HOMEPAGE (vecchia) | 1230:2138 | 1440×10172 | layout tipo sito live |
| **HOMEPAGE (DEFINITIVA)** | **1230:2206** | 1440×10339 | riferimento principale desktop (dark) — confermata dal cliente |
| HOMEPAGE BIANCA | 1230:2305 | 1440×10172 | tema chiaro |
| Homepage - iPhone | 1230:2619 | 390×4472 | mobile completo |
| Menu - iPhone | 1230:2690 | 390×844 | menu mobile aperto |
| MENU | 1230:2370 | — | componente, 2 varianti |
| ACCORDION METODO | 1230:2429 | — | 5 varianti |
| ACCORDION CAPABILITIES | 1230:2379 | — | 2 varianti |
| Capabilities | 1230:2521 | — | 7 varianti (nav 01-06) |
| Pulsante | 1230:2516 | — | 2 varianti |
| Component 7 | 1230:2479 | — | 6 varianti (nav/menu items) |

### Differenze HOMEPAGE definitiva (1230:2206) vs sito live
- **Hero nuova**: "Il concetto di progresso è un meccanismo protettivo che ci difende dai terrori del futuro" (il live ha "The future is already here…")
- **Menu inline nell'header** (Chi siamo / Metodo / Capabilities / Contatti come testi nell'header, logo più grande 210×50)
- **Capabilities più ariose**: titoli sezione più grandi (49px vs 39px), spaziatura verticale ~860px per sezione (vs ~515px)
- La sezione "GRUPPO CHI SIAMO" (scroll orizzontale) non è raggruppata nel frame ma il testo "…1/4" è presente → l'animazione orizzontale resta
- Il frame CAPABILITES di sfondo è nascosto (hidden) — verificare se lo sfondo scuro della sezione resta
- SFUMATURA SOPRA nascosta (hidden) nel frame definitivo

### Struttura sezioni homepage (ordine)
1. **Header**: logo espandibile + menu (Chi siamo, Metodo, Capabilities, Contatti) + theme switcher
2. **Hero**: citazione "The future is already here. It's just not evenly distributed." (+ variante "Il concetto di progresso è un meccanismo protettivo…" nel frame 1:74)
3. **Chi Siamo** (`#chi-siamo`): scroll orizzontale pinnato, 4 slide di testo, contatore 1/4
4. **Metodo** (`#metodo`): card scura con accordion hover (Anticipazione Strategica, Issue Shaping, Creazione di nuovi frame culturali, Stimolazione delle policy)
5. **Capabilities/Servizi** (`#capabilities`): 6 sezioni numerate con digit sticky — 01 Futures Strategy Unit, 02 PR & Future Media Relations, 03 Speculative Storytelling LAB, 04 Influence Design Studio, 05 Alternative Events & Experience Design, 06 Futures Policy LAB — ciascuna con accordion di sottovoci
6. **Contatti** (`#contatti`): testo invito + pulsante Contattaci + indirizzo/email/telefono
7. **Footer**: logo gigante SVG "T | L | L", ©2025, Privacy Policy

### Sfumature
Elementi "SFUMATURA SOPRA/SOTTO" nei frame: gradienti di transizione tra sezioni (probabilmente animati — da confermare con app.js).

## Mappatura React (bozza)

| Origine | Componente React |
|---|---|
| slides-horizontal | `<HorizontalSlides>` — GSAP pin+scrub, counter con containerAnimation |
| expand-digit-accordian | `<CapabilitiesSection>` — digit sticky + `<Accordion>` (Radix o custom, niente Bootstrap) |
| expand-accordion | `<HoverAccordion>` (Metodo) |
| expand-logo | `<ExpandLogo>` (header) |
| swiper-partners | `<PartnersMarquee>` (CSS puro) |
| main.js cursore | `<CustomCursor>` (client component globale) |
| main.js theme | `ThemeProvider` + CSS variables + bottone sticky |
| Lenis | `<SmoothScrollProvider>` (lenis/react) |

## Da fare
- [ ] Ricevere `themes/` e `uploads/` → analizzare `app.js` (A1, A9, A10) e censire asset
- [ ] Screenshot/context di tutti i frame Figma per la checklist visiva di parità
- [ ] Decisione font: licenza ABC Diatype o alternativa
- [ ] Verificare la differenza tra i due frame HOMEPAGE (1:6 vs 1:74) — quale hero vale?
