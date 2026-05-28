import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // French → English route redirects (permanent)
      { source: "/carte", destination: "/map", permanent: true },
      { source: "/comprendre", destination: "/understand", permanent: true },
      { source: "/compte", destination: "/account", permanent: true },
      { source: "/connexion", destination: "/login", permanent: true },
      { source: "/inscription", destination: "/signup", permanent: true },
      { source: "/signalements/nouveau", destination: "/reports/new", permanent: true },
      { source: "/signalements/:id", destination: "/reports/:id", permanent: true },
      { source: "/charte", destination: "/charter", permanent: true },
      { source: "/mot-de-passe-oublie", destination: "/forgot-password", permanent: true },
      { source: "/reinitialiser/:token", destination: "/reset-password/:token", permanent: true },
      { source: "/verifier-email/:token", destination: "/verify-email/:token", permanent: true },
      { source: "/declarer-effet-indesirable", destination: "/reports/new", permanent: true },
      { source: "/legal/cgu", destination: "/legal/terms", permanent: true },
      // Admin French → English
      { source: "/admin/signalements", destination: "/admin/reports", permanent: true },
      { source: "/admin/signalements/:id", destination: "/admin/reports/:id", permanent: true },
      { source: "/admin/utilisateurs", destination: "/admin/users", permanent: true },
      { source: "/admin/utilisateurs/:id", destination: "/admin/users/:id", permanent: true },
      { source: "/admin/referentiels", destination: "/admin/referentials", permanent: true },
      // Moderation French → English
      { source: "/moderation/signalements/:id", destination: "/moderation/reports/:id", permanent: true },
      // API redirects (signalements → reports)
      { source: "/api/signalements", destination: "/api/reports", permanent: true },
      { source: "/api/signalements/:path*", destination: "/api/reports/:path*", permanent: true },
      { source: "/api/moderation/signalements/:path*", destination: "/api/moderation/reports/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
