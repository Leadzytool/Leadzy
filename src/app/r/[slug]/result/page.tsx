"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [reward, setReward] = useState("");

  useEffect(() => {
    const r = sessionStorage.getItem("leadzy_reward");
    if (!r) {
      router.replace(`/r/${slug}`);
      return;
    }
    setReward(r);
  }, [slug, router]);

  function handleClaim() {
    router.push(`/r/${slug}/review`);
  }

  if (!reward) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Celebration */}
        <div className="space-y-2">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">Félicitations !</h1>
          <p className="text-gray-500">Vous avez gagné :</p>
        </div>

        {/* Reward display */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-lg">
          <p className="text-2xl font-bold">{reward}</p>
        </div>

        <Button onClick={handleClaim} className="w-full text-base">
          Récupérer mon cadeau
        </Button>

        <p className="text-xs text-gray-400">
          Présentez cet écran à votre serveur pour profiter de votre récompense.
        </p>
      </div>
    </div>
  );
}
