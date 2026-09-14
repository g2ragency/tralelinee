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
