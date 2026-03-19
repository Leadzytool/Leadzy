import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadzy — Collectez des leads & boostez vos avis Google",
  description:
    "La plateforme SaaS pour restaurants : collecte de données clients, avis Google et engagement via roue de récompense.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
