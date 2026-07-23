document.addEventListener('DOMContentLoaded', () => {
    // --- Logica Tema e Colori ---
    const body = document.body;
    const switchers = document.querySelectorAll('#theme-switcher, #theme-switcher-mobile');
    const cursor = document.getElementById('cursor');
    const shadow = document.getElementById('cursor-shadow');
    const footer = document.querySelector('footer');
    const blueBg = document.querySelector('.bluebg-sec');
    const popup = document.querySelector('#popup-content');
    const popup2 = document.querySelector('.popup-content');

    // NUOVI ELEMENTI GESTITI PER COERENZA TEMA/MENU MOBILE
    const mobileMenu = document.getElementById('main-nav');
    
    // CORREZIONE: Seleziona TUTTI i loghi (inclusi quelli nell'offcanvas)
    const logoDarkElements = document.querySelectorAll('.logo-light'); 
    const logoLightElements = document.querySelectorAll('.logo-dark');
    // FINE NUOVI ELEMENTI
    
    let isInFooter = false;

    // Funzione per aggiornare il testo del bottone (sia desktop che mobile)
    function updateButtonText(theme) {
        const newText = theme === 'dark-theme' ? 'Light' : 'Dark';
        switchers.forEach(s => {
            s.textContent = newText;
        });
    }

    // Funzione per gestire la visibilità dei loghi
    function updateLogoVisibility(theme) {
		if (logoDarkElements.length > 0 && logoLightElements.length > 0) {
			if (theme === 'dark-theme') {
				// TEMA SCURO: Mostra BIANCO (logo-dark), nascondi NERO (logo-light)

				logoDarkElements.forEach(el => el.setAttribute('style', 'display: block !important;'));
				logoLightElements.forEach(el => el.setAttribute('style', 'display: none !important;'));

			} else {
				// TEMA CHIARO: Nascondi BIANCO (logo-dark), mostra NERO (logo-light)

				logoDarkElements.forEach(el => el.setAttribute('style', 'display: none !important;'));
				logoLightElements.forEach(el => el.setAttribute('style', 'display: block !important;'));
			}
		}
	}

    // Colore del cursore in stato NORMALE (deve contrastare lo sfondo principale)
    function getCursorColor() {
        // Tema Scuro (Sfondo Scuro) -> Cursore Bianco
        // Tema Chiaro (Sfondo Chiaro) -> Cursore Nero
        return body.classList.contains('dark-theme') ? '#FFFFFF' : '#000000';
    }

    /**
     * CORREZIONE HOVER: Inverte il colore dello sfondo (body)
     */
    function getHoverColor() {
        // Se il tema è scuro (sfondo nero), l'hover deve essere BIANCO (chiaro)
        if (body.classList.contains('dark-theme')) {
            return '#FFFFFF'; 
        } else {
            // Se il tema è chiaro (sfondo bianco), l'hover deve essere NERO (scuro)
            return '#000000';
        }
    }

    // Funzione centralizzata per aggiornare i colori del cursore in base al tema
    function updateCursorColors() {
        const color = getCursorColor();
        
        if (isInFooter) {
             cursor.style.backgroundColor = '#fff';
             shadow.style.border = '1px solid #fff';
        } else {
             cursor.style.backgroundColor = color;
             shadow.style.border = `1px solid ${color}`;
        }
    }
    
    // Funzione principale per applicare il tema
    function applyTheme(theme) {
        if (theme === 'light-theme') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (mobileMenu) mobileMenu.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (mobileMenu) mobileMenu.classList.remove('light-theme');
        }
        localStorage.setItem('theme', theme);
        updateButtonText(theme);
        updateLogoVisibility(theme);
        updateCursorColors();
    }

    // Carica il tema salvato o imposta il default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Imposta il default (dark-theme)
        applyTheme('dark-theme'); 
    }

    // Gestore del cambio tema
    switchers.forEach(switcher => {
        switcher.addEventListener('click', () => {
            // Verifica il tema CORRENTE sul body per decidere il prossimo tema
            if (body.classList.contains('dark-theme')) {
                applyTheme('light-theme');
            } else {
                applyTheme('dark-theme');
            }
        });
    });

    // Inizializza i colori all'avvio
    updateCursorColors();

    // --- Logica Cursore di Movimento ---
    const coords = { x: 0, y: 0 };
    const prevCoords = { x: 0, y: 0 };

    window.addEventListener('mousemove', function (e) {
        coords.x = e.clientX;
        coords.y = e.clientY;
    });

    function update() {
        cursor.style.top = `${coords.y}px`;
        cursor.style.left = `${coords.x}px`;

        const y = lerp(prevCoords.y, coords.y, 0.1);
        const x = lerp(prevCoords.x, coords.x, 0.1);

        shadow.style.top = `${y}px`;
        shadow.style.left = `${x}px`;

        prevCoords.x = x;
        prevCoords.y = y;

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    function lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }

    // --- Gestione Hover Interattivi (Link, Bottoni) ---
    const interactiveElements = document.querySelectorAll('a, button, .popup-btn, .popup-btn2, .hoverable');

    interactiveElements.forEach((element) => {
        element.addEventListener('mouseenter', () => {
            const hoverColor = getHoverColor(); 
            
            cursor.style.width = '6rem';
            cursor.style.height = '6rem';
            
            // Applica il colore HOVER
            cursor.style.backgroundColor = hoverColor; 
            cursor.style.opacity = '0.7';
            shadow.style.opacity = '0';
        });

        element.addEventListener('mouseleave', () => {
            // Ripristina la dimensione
            cursor.style.width = '0.3rem';
            cursor.style.height = '0.3rem';
            cursor.style.opacity = '1';
            shadow.style.opacity = '1';
            
            // Re-applica i colori normali (tema o area speciale)
            updateCursorColors();
        });
    });

    // --- Gestione Aree che forzano il Cursore a Bianco ---

    // 1. Footer
    if (footer) {
        footer.addEventListener('mouseenter', () => {
            isInFooter = true;
            // Forza sempre a BIANCO nel footer
            cursor.style.backgroundColor = '#fff';
            shadow.style.border = '1px solid #fff';
        });
    
        footer.addEventListener('mouseleave', () => {
            isInFooter = false;
            updateCursorColors(); // Ritorna al colore del tema
        });
    }
    
    // 2. Aree con sfondo fisso (blueBg, popup, popup2)
    const whiteCursorAreas = [blueBg, popup, popup2].filter(el => el);
    
    whiteCursorAreas.forEach(area => {
        area.addEventListener('mouseenter', () => {
            // Forza sempre a BIANCO
            cursor.style.backgroundColor = '#fff';
            shadow.style.border = '1px solid #fff';
        });

        area.addEventListener('mouseleave', () => {
            updateCursorColors(); // Ritorna al colore del tema
        });
    });
    
    // --- LOGICA ANIMAZIONE LOGO (SplitType) ---
    document.querySelectorAll('.hoverable').forEach(hoverable => { 
        const reveal = hoverable.querySelector('.logo-reveal'); 
        if (reveal) {
            hoverable.addEventListener('mouseenter', () => { 
                gsap.to(reveal, { width: 'auto', opacity: 1, duration: 0.8, ease: 'power2.out' }); 
            }); 
            hoverable.addEventListener('mouseleave', () => { 
                gsap.to(reveal, { width: 0, opacity: 0, duration: 0.6, ease: 'power2.in' }); 
            }); 
        }
    }); 
	
	// --- Logica per Chiudere Menu Mobile e Scrollare ---
const offcanvasElement = document.getElementById('main-nav');
// Assicurati che l'oggetto Offcanvas di Bootstrap sia inizializzato
const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement); 

// Seleziona tutti i link del menu mobile
const mobileMenuLinks = document.querySelectorAll('#main-nav .m-main-menu a'); 

mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        const targetId = this.getAttribute('href');

        // Controlla se è un link di ancoraggio locale (es. #sezione1)
        if (targetId && targetId.startsWith('#')) {
            event.preventDefault(); // Impedisce il comportamento di default del link

            // 1. Chiudi l'Offcanvas
            // Bootstrap fornisce metodi per chiudere l'Offcanvas.
            bsOffcanvas.hide(); 
            
            // 2. Scrolla alla sezione di destinazione
            // Usa setTimeout per dare il tempo all'Offcanvas di iniziare la chiusura, 
            // e al Lenis (se lo usi per lo smooth scroll) di gestire lo scroll.
            setTimeout(() => {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Cerca il metodo di smooth scroll che stai usando.
                    // Se stai usando Lenis, questo è il metodo corretto:
                    if (window.lenis) {
                        window.lenis.scrollTo(targetElement, { 
                            offset: 0, // Regola se necessario (es. altezza header fisso)
                            duration: 1.5 // Durata dello scroll
                        });
                    } else {
                        // Fallback per smooth scroll standard
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }
            }, 300); // Ritardo in ms (dovrebbe corrispondere alla durata della transizione offcanvas)
        }
        // Se non è un link di ancoraggio (#), lascialo navigare normalmente
    });
});
});