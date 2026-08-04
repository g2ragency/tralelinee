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
      {/* Qui l'etichetta non è la solita: su mobile è un titolo vero e
          proprio, Regular 46px lh 110% bianco. Da desktop torna l'etichetta
          piccola Medium 24px GRIGIO1 come nelle altre sezioni. */}
      <p className="mb-[10px] text-[46px] font-normal leading-[1.1] tracking-[-0.04em] text-foreground xl:mb-6 xl:text-[24px] xl:font-medium xl:leading-[0.933] xl:tracking-[-0.72px] xl:text-label">
        Contatti
      </p>
      {/* Testo: Light 18px lh 110% su mobile, Regular 52px lh 102% da
          desktop; ls -4%. Si accende con lo scroll. */}
      <EvidenziaScroll
        paragrafi={[
          "Per istituzioni, imprese e organizzazioni che desiderano esplorare nuovi scenari, rafforzare il proprio posizionamento o attivare strategie di influenza culturale e comunicativa. Contattaci per avviare un dialogo e valutare insieme percorsi di collaborazione.",
        ]}
        classeP="text-left text-[18px] font-light leading-[1.1] tracking-[-0.04em] xl:text-[52px] xl:font-normal xl:leading-[1.02]"
      />
      <a
        href="/registrati"
        /* self-start: nella sezione ora flex, senza si stirerebbe a tutta larghezza */
        className="mt-10 inline-flex items-center justify-center self-start border border-foreground px-5 py-3 text-[18px] font-light leading-[1.1] tracking-[-0.04em] xl:mt-16 xl:py-3.5 xl:text-[24px] xl:font-normal xl:leading-[0.933]"
      >
        {/* Il Figma mobile chiama il pulsante «Contattaci», il desktop
            «Richiedi portfolio». `display:none` toglie la voce nascosta anche
            dallo screen reader, che quindi ne legge una sola. */}
        <span className="xl:hidden">Contattaci</span>
        <span className="hidden xl:inline">Richiedi portfolio</span>
      </a>
      {/* Light 18px lh 100% ls -4% su mobile, 24px da desktop */}
      <address className="mt-20 flex text-[18px] font-light not-italic leading-none tracking-[-0.04em] xl:mt-[319px] xl:justify-end xl:text-right xl:text-[24px] xl:font-normal">
        <div>
          <p className="text-grey">Indirizzo</p>
          <p>Viale Parioli 39c - Roma</p>
          <p className="text-grey">Email</p>
          <p>
            <a href="mailto:info@tralelinee.com">
              info@tralelinee.com
            </a>
          </p>
          <p className="text-grey">Cellulare</p>
          <p>
            <a href="tel:+393324353480">
              +39 332 435 3480
            </a>
          </p>
        </div>
      </address>
    </section>
  );
}
