import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-primary">Leadzy</span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost">Se connecter</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Commencer</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Collectez des leads,<br />
          <span className="text-primary">boostez vos avis Google</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
          La plateforme tout-en-un pour les restaurants : collecte email & téléphone,
          roue de récompenses, et redirection intelligente vers Google Avis.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/auth/register">
            <Button className="text-base px-8 py-4">
              Créer mon compte — Gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: "📲",
              title: "QR Code unique",
              desc: "Chaque restaurant a son QR code personnalisé qui redirige vers une expérience engageante.",
            },
            {
              icon: "🎡",
              title: "Roue de la fortune",
              desc: "Engagez vos clients avec une roue de récompenses configurable et des probabilités ajustables.",
            },
            {
              icon: "⭐",
              title: "Avis Google",
              desc: "Redirigez automatiquement les clients satisfaits vers votre page Google Avis.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 Leadzy. Tous droits réservés.
      </footer>
    </div>
  );
}
