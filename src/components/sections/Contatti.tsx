/*
  Contatti — testo invito + CTA "Richiedi portfolio" (Figma 1230:2281/2286)
  e blocco indirizzo allineato a destra (1230:2283).
  ponytail: la CTA è un placeholder — il flusso account/portfolio arriva
  nella fase 5 (Auth + Portfolio).
*/
import { EvidenziaScroll } from "@/components/EvidenziaScroll";

export function Contatti() {
  return (
    <section
      id="contatti"
      className="flex min-h-svh flex-col justify-center px-[10px] py-24 xl:px-10 xl:py-28"
    >
      {/* Etichetta: Medium 12px lh 110% su mobile, 24px lh 93.3% da desktop */}
      <p className="mb-6 text-[12px] font-medium leading-[1.1] tracking-[-0.04em] text-label xl:text-[24px] xl:leading-[0.933] xl:tracking-[-0.72px]">
        Contatti
      </p>
      {/* Testo: Regular 26px su mobile e 52px da desktop, lh 102%, ls -4%;
          si accende con lo scroll */}
      <EvidenziaScroll
        paragrafi={[
          "Per istituzioni, imprese e organizzazioni che desiderano esplorare nuovi scenari, rafforzare il proprio posizionamento o attivare strategie di influenza culturale e comunicativa. Contattaci per avviare un dialogo e valutare insieme percorsi di collaborazione.",
        ]}
        classeP="text-left text-[26px] font-normal leading-[1.02] tracking-[-0.04em] xl:text-[52px]"
      />
      <a
        href="/registrati"
        /* self-start: nella sezione ora flex, senza si stirerebbe a tutta larghezza */
        className="hoverable mt-10 inline-flex items-center justify-center self-start border border-foreground px-5 py-3 text-[16px] font-normal leading-[0.933] tracking-[-0.64px] xl:mt-16 xl:py-3.5 xl:text-[24px] xl:tracking-[-0.96px]"
      >
        Richiedi portfolio
      </a>
      <address className="mt-20 flex text-[16px] not-italic leading-snug tracking-[-0.64px] xl:mt-[319px] xl:justify-end xl:text-right xl:text-[24px] xl:leading-none xl:tracking-[-0.96px]">
        <div>
          <p className="text-grey">Indirizzo</p>
          <p>Viale Parioli 39c - Roma</p>
          <p className="text-grey">Email</p>
          <p>
            <a href="mailto:info@tralelinee.com" className="hoverable">
              info@tralelinee.com
            </a>
          </p>
          <p className="text-grey">Cellulare</p>
          <p>
            <a href="tel:+393324353480" className="hoverable">
              +39 332 435 3480
            </a>
          </p>
        </div>
      </address>
    </section>
  );
}
