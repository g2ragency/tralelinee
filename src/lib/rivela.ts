import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
  «Mask text reveal»: le righe salgono da dietro una maschera, una dopo
  l'altra. E' l'effetto del componente Framer indicato dal cliente, che e'
  fatto con questo stesso SplitText (gratuito da GSAP 3.13).

  Si aspetta il font: le righe si misurano sul testo impaginato, e col font
  di ripiego cadrebbero altrove. Finita la salita si torna al DOM originale
  (`revert`): le righe fisse non reggerebbero un ridimensionamento, e la
  maschera taglierebbe le discendenti con l'interlinea stretta del sito.
  Chi ha altro da attaccare al testo — l'accensione con lo scroll — lo fa in
  `alTermine`, sui nodi ripristinati.

  Gli elementi partono con la classe `invisible` scritta nel markup, cosi'
  fra la prima pittura e la divisione in righe non si vede il testo intero
  per un attimo; la classe se ne va nell'istante in cui parte la salita.
*/
/*
  Stessa salita da dietro la maschera, per i testi già divisi in parole e
  caratteri (EvidenziaScroll) e senza SplitText.

  SplitText su quei paragrafi percorreva un elemento per carattere e a
  ognuno rimisurava la pagina: sulla home, ~1.700 caratteri, un telefono
  medio restava bloccato 5,6 secondi all'apertura (traccia di Chrome, 18/11).
  Qui le righe si ricavano con UNA lettura della posizione delle parole, e
  sale ogni parola con la propria maschera: le parole di una riga partono
  insieme, quindi a schermo è la stessa salita per righe.

  La maschera è un clip-path che si muove con la parola: scesa del 110%, ne
  resta visibile solo la parte sopra il bordo di partenza, cioè niente.
  A salita finita si tolgono transform e clip, come faceva il revert.

  L'animazione è del browser (Web Animations), non di GSAP: con GSAP ogni
  fotogramma ricalcolava il clip di ~300 parole sul thread principale, e la
  salita costava fotogrammi da 110-150ms su un telefono medio. Così la
  esegue il compositore. Curva e tempi sono quelli di prima: power3.out,
  0,9s, 0,1s di scarto fra una riga e la successiva.
*/
const POWER3_OUT = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const NASCOSTA = { transform: "translateY(110%)", clipPath: "inset(0 0 110% 0)" };
const VISIBILE = { transform: "translateY(0)", clipPath: "inset(0 0 0% 0)" };

export function rivelaParole(
  paragrafi: HTMLElement[],
  { alTermine }: { alTermine?: () => void },
) {
  const mostra = () =>
    paragrafi.forEach((el) => el.classList.remove("invisible"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mostra();
    alTermine?.();
    return () => {};
  }

  let vivo = true;
  let trigger: ScrollTrigger | null = null;
  let animazioni: Animation[] = [];
  const parole = paragrafi.flatMap((p) => [
    ...p.querySelectorAll<HTMLElement>("[data-parola]"),
  ]);
  const pulisci = () =>
    parole.forEach((w) => {
      w.style.transform = "";
      w.style.clipPath = "";
    });

  document.fonts.ready.then(() => {
    if (!vivo || parole.length === 0) return;
    // Una sola lettura: la riga di ogni parola è la sua quota.
    const quote = parole.map((w) => Math.round(w.getBoundingClientRect().top));
    const righe: number[] = [];
    let riga = -1;
    quote.forEach((y, i) => {
      if (i === 0 || Math.abs(y - quote[i - 1]) > 2) riga++;
      righe.push(riga);
    });
    // Nascoste finché il testo non entra in vista.
    parole.forEach((w) => Object.assign(w.style, NASCOSTA));
    mostra();

    trigger = ScrollTrigger.create({
      trigger: paragrafi[0],
      start: "top 85%",
      once: true,
      onEnter() {
        animazioni = parole.map((w, i) =>
          w.animate([NASCOSTA, VISIBILE], {
            duration: 900,
            delay: righe[i] * 100,
            easing: POWER3_OUT,
            fill: "both",
          }),
        );
        // L'animazione tiene lo stato: lo stile scritto a mano non serve più.
        pulisci();
        Promise.all(animazioni.map((a) => a.finished))
          .then(() => {
            if (!vivo) return;
            animazioni.forEach((a) => a.cancel());
            animazioni = [];
            alTermine?.();
          })
          .catch(() => {});
      },
    });
  });

  return () => {
    vivo = false;
    trigger?.kill();
    animazioni.forEach((a) => a.cancel());
    pulisci();
  };
}

export function rivelaRighe(
  elementi: HTMLElement[],
  { inVista, alTermine }: { inVista: boolean; alTermine?: () => void },
) {
  const mostra = () =>
    elementi.forEach((el) => el.classList.remove("invisible"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mostra();
    alTermine?.();
    return () => {};
  }

  let split: SplitText | null = null;
  let tween: gsap.core.Tween | null = null;
  let vivo = true;

  document.fonts.ready.then(() => {
    if (!vivo) return;
    split = SplitText.create(elementi, { type: "lines", mask: "lines" });
    mostra();
    tween = gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: inVista
        ? { trigger: elementi[0], start: "top 85%", once: true }
        : undefined,
      onComplete() {
        split?.revert();
        split = null;
        alTermine?.();
      },
    });
  });

  return () => {
    vivo = false;
    tween?.scrollTrigger?.kill();
    tween?.kill();
    split?.revert();
  };
}
