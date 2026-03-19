"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Reward {
  id: string;
  label: string;
  probability: number;
  color: string;
}

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#64748b", "#ec4899", "#14b8a6"];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("rewards")
      .select("*")
      .eq("restaurant_id", user.id)
      .order("created_at");

    if (data) setRewards(data);
    setLoading(false);
  }

  function updateReward(index: number, field: keyof Reward, value: string | number) {
    setRewards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addReward() {
    setRewards((prev) => [
      ...prev,
      {
        id: "new-" + Date.now(),
        label: "",
        probability: 0.1,
        color: COLORS[prev.length % COLORS.length],
      },
    ]);
  }

  function removeReward(index: number) {
    setRewards((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete all existing rewards and re-insert
    await supabase.from("rewards").delete().eq("restaurant_id", user.id);
    await supabase.from("rewards").insert(
      rewards.map((r) => ({
        restaurant_id: user.id,
        label: r.label,
        probability: r.probability,
        color: r.color,
      }))
    );

    setSaving(false);
  }

  const totalProb = rewards.reduce((sum, r) => sum + Number(r.probability), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Récompenses</h1>
          <p className="text-gray-500">Configurez votre roue de la fortune</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          Enregistrer
        </Button>
      </div>

      {Math.abs(totalProb - 1) > 0.01 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          La somme des probabilités est de {(totalProb * 100).toFixed(0)}% — elle devrait être de 100%.
        </div>
      )}

      <div className="space-y-3">
        {rewards.map((reward, i) => (
          <Card key={reward.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            {/* Color */}
            <input
              type="color"
              value={reward.color}
              onChange={(e) => updateReward(i, "color", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
            />

            {/* Label */}
            <div className="flex-1 w-full">
              <Input
                placeholder="Ex: -10% sur l'addition"
                value={reward.label}
                onChange={(e) => updateReward(i, "label", e.target.value)}
              />
            </div>

            {/* Probability */}
            <div className="w-28">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(reward.probability * 100)}
                  onChange={(e) =>
                    updateReward(i, "probability", Number(e.target.value) / 100)
                  }
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => removeReward(i)}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addReward}>
        + Ajouter une récompense
      </Button>
    </div>
  );
}
