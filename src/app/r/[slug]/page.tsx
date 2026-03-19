"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDemo, DEMO_RESTAURANT } from "@/lib/utils";

export default function ClientFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<{ id: string; name: string; logo_url: string } | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setRestaurant(DEMO_RESTAURANT);
        setPageLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, logo_url")
        .eq("slug", slug)
        .single();

      if (data) setRestaurant(data);
      setPageLoading(false);
    }
    load();
  }, [slug]);

  function validate() {
    const e: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Email invalide";
    }
    if (!/^[\d\s+()-]{8,}$/.test(phone)) {
      e.phone = "Numéro de téléphone invalide";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !restaurant) return;
    setLoading(true);

    if (isDemo) {
      sessionStorage.setItem("leadzy_lead_id", "demo-lead");
      sessionStorage.setItem("leadzy_restaurant_id", restaurant.id);
      router.push(`/r/${slug}/wheel`);
      return;
    }

    const supabase = createClient();
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({ restaurant_id: restaurant.id, email, phone })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError);
    }

    if (lead) {
      sessionStorage.setItem("leadzy_lead_id", lead.id);
      sessionStorage.setItem("leadzy_restaurant_id", restaurant.id);
      router.push(`/r/${slug}/wheel`);
    } else {
      // Fallback: bypass lead save and go to wheel anyway
      sessionStorage.setItem("leadzy_lead_id", "bypass-" + Date.now());
      sessionStorage.setItem("leadzy_restaurant_id", restaurant.id);
      router.push(`/r/${slug}/wheel`);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-gray-500">Restaurant introuvable.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          {restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="mx-auto h-16 w-16 rounded-xl object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-500">
            Tentez votre chance et gagnez une récompense exclusive !
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <Input
            id="email"
            label="Votre email"
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            id="phone"
            label="Votre téléphone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Accéder à la roue
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Vos données sont protégées et ne seront pas partagées.
        </p>
      </div>
    </div>
  );
}
