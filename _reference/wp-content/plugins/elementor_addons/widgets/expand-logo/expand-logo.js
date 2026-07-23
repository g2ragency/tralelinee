document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.logo-block').forEach(block => {
        const rest = block.querySelector('.rest');
        const separatorRight = block.querySelector('.separator-right');

        block.addEventListener('mouseenter', () => {
            gsap.to(rest, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(separatorRight, {
                x: 30, // sposta la linea destra a destra
                duration: 0.3,
                ease: "power2.out"
            });
        });

        block.addEventListener('mouseleave', () => {
            gsap.to(rest, {
                opacity: 0,
                x: -10,
                duration: 0.3,
                ease: "power2.inOut"
            });

            gsap.to(separatorRight, {
                x: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
        });
    });
});
