import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Dal 25/11/2026 il portfolio è aperto e non ci sono più account per i
    visitatori: i vecchi indirizzi di accesso, registrazione e account non
    devono finire su una pagina 404 (qualcuno li ha nei preferiti o in una
    email). Non permanenti: se un giorno tornano, il browser non li ricorda.
  */
  async redirects() {
    return [
      { source: "/login", destination: "/admin/accesso", permanent: false },
      { source: "/registrati", destination: "/portfolio", permanent: false },
      { source: "/account", destination: "/portfolio", permanent: false },
      { source: "/admin/accessi", destination: "/admin", permanent: false },
    ];
  },
};

export default nextConfig;
