import { Loghi } from "./Loghi";

/*
  Clienti — la fila di loghi che scorre, come nel sito precedente.

  Riusa il carosello della copertura stampa: è già una pista che scorre
  all'infinito con la velocità calcolata sulla larghezza misurata, e un
  secondo componente che fa la stessa cosa sarebbe solo una copia da tenere
  allineata a mano.

  I file stanno in `public` e non nel bucket: sono i loghi dell'agenzia, non
  contenuto che si compila dall'area riservata, quindi non hanno bisogno né di
  un caricamento né di un indirizzo firmato.
*/
const LOGHI = [
  "/clienti/logo-1.png",
  "/clienti/logo-2.png",
  "/clienti/logo-3.png",
  "/clienti/logo-10.png",
  "/clienti/logo-4.png",
  "/clienti/logo-alkemy.png",
  "/clienti/logo-5.png",
  "/clienti/logo-6.png",
  "/clienti/logo-7.png",
  "/clienti/logo-8.png",
  "/clienti/logo-9.png",
];

export function Clienti() {
  return (
    <section className="px-[10px] py-20 xl:px-10 xl:py-32">
      {/* Stessa etichetta delle altre sezioni: 24px grigia */}
      <p className="text-[18px] leading-[1.2] tracking-[-0.04em] text-grey xl:text-[24px]">
        Clienti
      </p>
      <div className="mt-10 xl:mt-16">
        <Loghi titolo="" righe={[LOGHI]} />
      </div>
    </section>
  );
}
