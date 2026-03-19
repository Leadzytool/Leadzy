"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FortuneWheel } from "@/components/fortune-wheel";
import { isDemo, DEMO_REWARDS } from "@/lib/utils";

interface Reward {
  id: string;
  label: string;
  probability: number;
  color: string;
}

export default function WheelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check that form was completed
    if (!sessionStorage.getItem("leadzy_lead_id")) {
      router.replace(`/r/${slug}`);
      return;
    }

    async function load() {
      if (isDemo) {
        setRewards(DEMO_REWARDS);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id, logo_url")
        .eq("slug", slug)
        .single();

      if (!restaurant) return;

      setLogoUrl(restaurant.logo_url || "");

      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("id, label, probability, color")
        .eq("restaurant_id", restaurant.id);

      if (rewardsData) setRewards(rewardsData);
      setLoading(false);
    }
    load();
  }, [slug, router]);

  async function handleResult(reward: Reward) {
    // Save reward to lead
    const leadId = sessionStorage.getItem("leadzy_lead_id");
    if (leadId && !isDemo) {
      const supabase = createClient();
      await supabase.from("leads").update({ reward: reward.label }).eq("id", leadId);
    }

    // Store result for next page
    sessionStorage.setItem("leadzy_reward", reward.label);
    router.push(`/r/${slug}/result`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tournez la roue !</h1>
        <p className="text-gray-500">Découvrez votre récompense</p>
        <FortuneWheel
          rewards={rewards}
          logoUrl={logoUrl || undefined}
          onResult={handleResult}
        />
      </div>
    </div>
  );
}
