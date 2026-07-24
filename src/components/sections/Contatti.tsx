/*
  Contatti — testo invito + CTA "Richiedi portfolio" (Figma 1230:2281/2286)
  e blocco indirizzo allineato a destra (1230:2283).
  ponytail: la CTA è un placeholder — il flusso account/portfolio arriva
  nella fase 5 (Auth + Portfolio).
*/
export function Contatti() {
  return (
    <section
      id="contatti"
      className="mx-auto max-w-[1440px] px-6 py-24 xl:px-10 xl:py-40"
    >
      <p className="mb-6 text-[40px] leading-[0.97] tracking-[-1.6px] xl:text-[24px] xl:font-medium xl:leading-[0.933] xl:tracking-[-0.96px]">
        Contatti
      </p>
      <p className="max-w-[340px] text-[15px] leading-[1.2] tracking-[-0.45px] text-grey2 xl:max-w-none xl:text-[52px] xl:leading-[1.02] xl:tracking-[-2.08px] xl:text-foreground">
        Per istituzioni, imprese e organizzazioni che desiderano esplorare
        nuovi scenari, rafforzare il proprio posizionamento o attivare
        strategie di influenza culturale e comunicativa. Contattaci per
        avviare un dialogo e valutare insieme percorsi di collaborazione.
      </p>
      <a
        href="#contatti"
        className="hoverable mt-10 inline-flex items-center justify-center border border-foreground px-5 py-3 text-[16px] leading-[0.933] tracking-[-0.64px] xl:mt-16 xl:py-3.5 xl:text-[24px] xl:tracking-[-0.96px]"
      >
        Richiedi portfolio
      </a>
      <address className="mt-20 flex text-[16px] not-italic leading-snug tracking-[-0.64px] xl:mt-24 xl:justify-end xl:text-right xl:text-[24px] xl:leading-none xl:tracking-[-0.96px]">
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
