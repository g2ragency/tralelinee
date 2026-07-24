/*
  Contatti — testo invito + CTA "Richiedi portfolio" (Figma 1230:2281/2286)
  e blocco indirizzo allineato a destra (1230:2283).
  ponytail: la CTA è un placeholder — il flusso account/portfolio arriva
  nella fase 5 (Auth + Portfolio).
*/
export function Contatti() {
  return (
    <section id="contatti" className="px-6 py-24 xl:px-10 xl:py-40">
      <p className="mb-6 text-[24px] font-medium leading-[0.933] tracking-[-0.96px]">
        Contatti
      </p>
      <p className="text-3xl leading-[1.02] tracking-[-1.2px] xl:text-[52px] xl:tracking-[-2.08px]">
        Per istituzioni, imprese e organizzazioni che desiderano esplorare
        nuovi scenari, rafforzare il proprio posizionamento o attivare
        strategie di influenza culturale e comunicativa. Contattaci per
        avviare un dialogo e valutare insieme percorsi di collaborazione.
      </p>
      <a
        href="#contatti"
        className="hoverable mt-16 inline-flex items-center justify-center border border-foreground px-5 py-3.5 text-[24px] leading-[0.933] tracking-[-0.96px]"
      >
        Richiedi portfolio
      </a>
      <address className="mt-24 flex justify-end text-right text-[24px] not-italic leading-none tracking-[-0.96px]">
        <div>
          <p className="font-medium text-grey">Indirizzo</p>
          <p>Viale Parioli 39c - Roma</p>
          <p className="font-medium text-grey">Email</p>
          <p>
            <a href="mailto:info@tralelinee.com" className="hoverable">
              info@tralelinee.com
            </a>
          </p>
          <p className="font-medium text-grey">Cellulare</p>
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
