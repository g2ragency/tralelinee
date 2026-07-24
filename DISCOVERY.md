# Discovery — Inventario sito live + Figma

Stato: **COMPLETA**. Analizzati: sito live, tema `themebase`, widget custom, uploads, Figma definitivo.

## Verdetto sull'infrastruttura JS del sito live

Il sito carica molte librerie ma ne usa poche — parecchio codice è **morto**:

| Libreria | Stato reale | Nel nuovo sito React |
|---|---|---|
| GSAP + ScrollTrigger | ✅ usati (scroll orizzontale, digit sticky, logo hover) | ✅ GSAP + ScrollTrigger |
| Lenis | ❌ caricato ma **mai inizializzato** (nessun `new Lenis()` nel codice) | ✅ Lenis vero — lo smooth scroll attuale è il plugin `mousewheel-smooth-scroll` |
| `themebasejs/app.js` | ❌ **404 anche in produzione**: bug in functions.php (`get_template_directory_uri() . 'js/app.js'` senza slash → URL `themebasejs/app.js` inesistente) | — niente da replicare |
| SplitType | ❌ caricato, mai usato | — |
| MorphSVGPlugin | ❌ caricato dal widget expand-logo, ma il JS usa solo opacity/x | — |
| Swiper 11 | ❌ caricato, il marquee partner è in CSS puro | — |
| Bootstrap | usato per collapse accordion + offcanvas menu | sostituito da componenti nativi/Radix |
| jQuery | caricato da WP, non usato dalle animazioni | — |

→ A1 = plugin SmoothScroll (nel nuovo sito: Lenis). **A9 e A10 non esistono** (app.js morto, hero statica, nessun morph reale). Il catalogo vero e completo è A2–A8.

## Asset e markup di riferimento (branch `reference/wp-content`)

- Logo header: **testuale** (HTML `| T | L | L |` con span `.logo-reveal`, doppia versione dark/light) — niente immagine, si ricrea in JSX
- Logo footer: `uploads/2025/07/logo-tll-xxl-scaled.png` (dark) + `logo-xxl-chiaro-scaled.png` (light) — nel Figma è vettoriale, meglio esportare SVG da Figma
- Font Diatype Trial: `themes/themebase/inc/assets/fonts/ABCDiatype-{Light,Regular,Medium,Heavy,Bold}-Trial.woff`
- Header: menu desktop inline sopra breakpoint xl, hamburger+offcanvas sotto; bottone theme-switcher testuale "Dark"/"Light"
- Tema WP = fork di WP Bootstrap Starter; pagina montata in Elementor, nessuna entrance animation Elementor usata

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
| A1 | Smooth scroll globale | plugin `mousewheel-smooth-scroll` | Inerzia sulla rotella; nel nuovo sito: Lenis (scrollTo con duration 1.5 come da main.js) |
| A2 | Cursore custom | main.js | Dot 0.3rem che segue il mouse + ombra ad anello con lerp 0.1 (rAF); su hover di link/bottoni: cresce a 6rem, colore invertito rispetto al tema, opacity 0.7; nel footer e aree scure forzato bianco |
| A3 | Chi Siamo — scroll orizzontale | widget `slides-horizontal` | Sezione pinnata, `gsap.to(x: -scrollLength)` scrub, end dinamico = larghezza contenuto; contatore fisso "n/4" aggiornato con `containerAnimation` trigger a `left center`; contatore visibile solo durante il pin |
| A4 | Capabilities — digit sticky 01→06 | widget `expand-digit-accordian` | ScrollTrigger pin del numero gigante (start `top top+=100`, end `bottom center`, pinSpacing false); visibilità solo dentro la sezione; `numberText` cambia a ogni sezione (trigger `top`); nav interna con smooth scrollTo compensato dall'altezza sticky +30px |
| A5 | Capabilities — accordion interni | widget `expand-digit-accordian` | Bootstrap collapse (un solo aperto per sezione, `data-bs-parent`) |
| A6 | Metodo — accordion hover | widget `expand-accordion` | Su mouseover: `max-height` 0→scrollHeight, opacity 0→1, padding animato; linea verticale `scaleY` proporzionale ad altezza contenuto (base 58px) |
| A7 | Logo header "T\|L\|L" espandibile | widget `expand-logo` + main.js | mouseenter: `rest` (RA/E/INEE) opacity 0→1 e x -10→0 (0.3s power2.out), separatore destro x+30; mouseleave inverso (power2.inOut); + `.logo-reveal` con width 0→auto 0.8s |
| A8 | Marquee partner | widget `swiper-partners` | Nastro CSS infinito: loghi duplicati ×2, durata = larghezza/velocità (80 px/s desktop, 130 mobile), CSS custom properties `--marquee-distance`/`--marquee-duration` |
| ~~A9~~ | ~~Logo morph~~ | — | Non esiste: MorphSVG caricato ma mai usato |
| ~~A10~~ | ~~Hero/sfumature animate~~ | — | Non esiste: app.js è un 404, hero statica; le sfumature sono gradienti CSS statici |

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

### Differenze HOMEPAGE definitiva (1230:2206) vs sito live — VERIFICATE VISIVAMENTE
Confronto fatto renderizzando il sito (mirror locale + Chromium, dark/light/mobile) contro il Figma a piena risoluzione:

- **Hero**: il live è GIÀ aggiornato con "Il concetto di progresso…" → live e Figma allineati
- **CTA Contatti**: Figma dice **"Richiedi portfolio"**, live dice "Contattaci" → è l'entry point del nuovo flusso account/portfolio. Il form contatti diventa/affianca la richiesta di accesso al portfolio
- **Capabilities più ariose** nel Figma: titoli più grandi (49px), più spazio verticale per sezione, icone "+" sulle righe accordion
- Menu inline nell'header presente in entrambi (live: visibile sopra breakpoint xl)
- Theme switcher live: in alto a destra, testo "Light"/"Dark", hover con cerchio — nel nuovo sito diventa **sticky in basso a destra** (richiesta cliente)
- Composizione hero: grigio/bianco alternato sulle parole chiave, identico in entrambi

### Verifica visiva effettuata (mirror locale)
Il sito è stato renderizzato offline da `_reference/` (HTML + CSS + asset + font locali, CDN scaricate) con Chromium/Playwright su localhost: screenshot dark/light, tutte le sezioni, mobile 390px e menu mobile. Il mirror servirà anche come **riferimento per i confronti pixel-per-pixel** durante lo sviluppo (script in scratchpad: `mirror/` + `shot2.js`).

### Struttura sezioni homepage (ordine)
1. **Header**: logo espandibile + menu (Chi siamo, Metodo, Capabilities, Contatti) + theme switcher
2. **Hero**: citazione "The future is already here. It's just not evenly distributed." (+ variante "Il concetto di progresso è un meccanismo protettivo…" nel frame 1:74)
3. **Chi Siamo** (`#chi-siamo`): scroll orizzontale pinnato, 4 slide di testo, contatore 1/4
4. **Metodo** (`#metodo`): card scura con accordion hover (Anticipazione Strategica, Issue Shaping, Creazione di nuovi frame culturali, Stimolazione delle policy)
5. **Capabilities/Servizi** (`#capabilities`): 6 sezioni numerate con digit sticky — 01 Futures Strategy Unit, 02 PR & Future Media Relations, 03 Speculative Storytelling LAB, 04 Influence Design Studio, 05 Alternative Events & Experience Design, 06 Futures Policy LAB — ciascuna con accordion di sottovoci
6. **Contatti** (`#contatti`): testo invito + pulsante Contattaci + indirizzo/email/telefono
7. **Footer**: logo gigante SVG "T | L | L", ©2025, Privacy Policy

### Sfumature
Elementi "SFUMATURA SOPRA/SOTTO" nei frame: gradienti CSS **statici** di transizione tra sezioni (non animati — app.js è morto).

## Dettaglio fine animazioni — CONFERMATO VISIVAMENTE frame-per-frame

Simulazione mouse + cattura frame intermedi sul mirror locale (script `shot3.js`). Valori esatti per la replica React:

### Cursore custom (A2) — due elementi a velocità diverse
- **Dot**: `#cursor`, 0.3rem, `border-radius:50%`, `position:fixed`, `transform:translate(-50%,-50%)`, `z-index:100`. Segue il mouse **istantaneo** (aggiornato ogni `mousemove`).
- **Ring**: `#cursor-shadow`, 4.5rem, bordo `1px solid`. Insegue con **lerp 0.1** dentro `requestAnimationFrame` → ritardo elastico morbido. Transition `opacity 0.1s`.
- **Hover su `a, button, .popup-btn, .popup-btn2, .hoverable`**: il dot cresce a **6rem**, `background-color` = colore *opposto* al tema (dark→bianco, light→nero), `opacity 0.7`; il ring va a `opacity 0`. Transition `width/height/background-color/opacity 0.2s ease`. Al mouseleave torna 0.3rem e ricalcola il colore del tema.
- **Colore base**: dark → bianco `#FFF`; light → nero `#000`.
- **Aree che forzano il cursore a bianco**: `footer`, `.bluebg-sec`, `#popup-content`, `.popup-content`.
- **Mobile ≤768px**: cursore custom `display:none`, cursore di sistema normale.

### Cambio tema (feature "cambio colore") — CONFERMATO: crossfade, non switch secco
- Sul `body`: `transition: background-color 0.3s, color 0.3s` → **crossfade di 300ms** (catturato il frame a metà con sfondo grigio intermedio nero↔off-white).
- Toggle classe `dark-theme`/`light-theme` sul body; persistenza `localStorage.theme`; default `dark-theme`.
- Contestualmente: testo bottone Light↔Dark, swap dei due set di logo (`.logo-light`/`.logo-dark`), inversione colore cursore.
- Bottone switcher: ha un proprio hover con cerchio pieno (dark/light) dietro il testo, `transition: all 0.3s`.
- **Nel nuovo sito**: identico ma bottone **sticky in basso a destra** (richiesta cliente) invece che in header. Implementazione consigliata: CSS variables `--bg-color`/`--text-color` su `:root[data-theme]`, transition 300ms, `next-themes` o provider custom + cookie/localStorage per evitare flash.

### Logo espandibile (A7) — confermato
Hover su ogni `.hoverable`: la lettera iniziale rivela il resto (`T`→`RA`, `L`→`E`, `L`→`INEE`) con `.logo-reveal` che va da `width:0` a `width:auto`, `opacity 0→1`, GSAP 0.8s power2.out (mouseleave: 0.6s power2.in).

## Inventario contenuti (copy 1:1) — fonte: Figma definitivo + testi tema

> Al momento del build, prelevare il testo **verbatim** dai text node del Figma 1230:2206 (o dal live). Sintesi:

**Header / menu**: Chi siamo · Metodo · Capabilities · Contatti — logo `| T | L | L |`

**Hero**: «Il concetto di progresso è un meccanismo protettivo che ci difende dai terrori del futuro» (parole chiave in bianco, resto in grigio)

**Chi Siamo** (4 slide, scroll orizzontale, contatore n/4):
1. Tra le linee è un'agenzia di comunicazione cross mediale e interdisciplinare specializzata nell'elaborazione e gestione di sistemi di influenza integrati.
2. Progettiamo significati, costruiamo senso e visione per chi vuole affermare il proprio posizionamento profondo e coerente.
3. Pensiamo narrazioni e produciamo immagini influenzando narrazioni pubbliche e private attraverso meccanismi di elaborazione e diffusione di frame target.
4. Applichiamo lo speculative design alla comunicazione classica per creare strumenti innovativi ed efficaci, editoriali, relazionali e istituzionali.

**Metodo** (accordion hover, intro + 4 voci):
- Intro: «Costruiamo narrazioni che generano immaginari… / Integriamo gli strumenti dello speculative design…»
- Anticipazione Strategica — Immaginare scenari futuri per aiutare clienti, istituzioni o brand a posizionarsi prima che accadano i cambiamenti
- Issue Shaping — Costruisci mondi futuri e fai in modo che il tuo cliente plasmi il dibattito
- Creazione di nuovi frame culturali — Nuovi modi di pensare problemi consolidati (lavoro, benessere, identità) creando un "campo semantico" dove il cliente è già leader
- Stimolazione delle policy

**Servizi/Capabilities** (intro + 6 sezioni numerate con digit sticky; ogni voce ha accordion "+"):
- Intro: «Chiamati dalla vocazione agli scenari del futuro, plasmiamo il dibattito pubblico costruendo nuovi mondi narrativi…»
- **01 Futures Strategy Unit**: Trend Intelligence & Media Monitoring · Speculative Brand Positioning · Future Audience Mapping · Competitor Analysis · Brand Identity
- **02 Pr & Future Media Relations**: Narrative PR & Speculative Relations · Media Relations Aumentate · Crisis Prevention · Press Office · Influencer Narrative Collaborations
- **03 Speculative Storytelling LAB**: Content & Digital Strategy · Social Media Casting · Content Marketing · SEO & Cultural Framing · Interactive Experiences
- **04 Influence Design Studio**: Visual Communication & Design Fiction · Brand Identity Evolution · Artefatti Speculativi · Advertising Concepts Disruptive · Future UX/UI Design
- **05 Alternative Events & Experience Design**: Workshop · Hybrid Reality Events · Brand Fiction Installations · Speculative Product Launches
- **06 Futures Policy LAB**: Futures Regulatory Scanner · Policy Workshops · Regulatory Future Narratives · Impact Assessment Speculativo

**Contatti**: «Per istituzioni, imprese e organizzazioni che desiderano esplorare nuovi scenari, rafforzare il proprio posizionamento o attivare strategie di influenza culturale e comunicativa. Contattaci per avviare un dialogo e valutare insieme percorsi di collaborazione.» — CTA **«Richiedi portfolio»** (entry point flusso account/portfolio)
- Indirizzo: Viale Parioli 39c - Roma · Email: info@tralelinee.com · Cellulare: +39 332 435 3480

**Footer**: logo gigante `| T | L | L |` (vettoriale) · ©2025 Tra le linee All Rights Reserved · Privacy Policy

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
- [x] ~~Ricevere `themes/` e `uploads/`~~ → analizzati, catalogo chiuso
- [x] ~~Quale frame HOMEPAGE vale~~ → 1230:2206 (confermato dal cliente)
- [ ] Screenshot/context di tutti i frame Figma per la checklist visiva di parità (in fase Fondamenta)
- [ ] **Decisione font: licenza ABC Diatype o alternativa** (aperto — da discutere col cliente)
- [ ] Conferma sfondo sezione Capabilities nel frame definitivo (CAPABILITES hidden nel Figma)
