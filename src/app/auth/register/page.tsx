"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Erreur lors de l'inscription.");
      setLoading(false);
      return;
    }

    // 2. Create restaurant profile
    const slug = generateSlug(name) + "-" + Date.now().toString(36);
    const { error: profileError } = await supabase.from("restaurants").insert({
      id: authData.user.id,
      name,
      email,
      slug,
    });

    if (profileError) {
      setError("Erreur lors de la création du profil.");
      setLoading(false);
      return;
    }

    // 3. Create default rewards
    const defaultRewards = [
      { label: "-10% sur l'addition", probability: 0.3, color: "#6366f1" },
      { label: "Dessert offert", probability: 0.25, color: "#f59e0b" },
      { label: "Café offert", probability: 0.25, color: "#10b981" },
      { label: "-20% sur l'addition", probability: 0.1, color: "#ef4444" },
      { label: "Apéritif offert", probability: 0.05, color: "#8b5cf6" },
      { label: "Tentez encore !", probability: 0.05, color: "#64748b" },
    ];

    await supabase.from("rewards").insert(
      defaultRewards.map((r) => ({ ...r, restaurant_id: authData.user!.id }))
    );

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Leadzy</h1>
          <p className="mt-2 text-gray-500">Créez votre compte restaurateur</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Nom du restaurant"
              placeholder="Le Petit Bistrot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="restaurant@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              placeholder="Minimum 6 caractères"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Créer mon compte
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
