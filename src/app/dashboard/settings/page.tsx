"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name);
        setGoogleUrl(data.google_review_url || "");
        setSocialUrl(data.social_url || "");
        setLogoUrl(data.logo_url || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("restaurants")
      .update({
        name,
        google_review_url: googleUrl,
        social_url: socialUrl,
        logo_url: logoUrl,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(urlData.publicUrl);

      await supabase
        .from("restaurants")
        .update({ logo_url: urlData.publicUrl })
        .eq("id", user.id);
    }

    setUploading(false);
  }

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
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-gray-500">Personnalisez votre page et vos liens</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          {saved ? "✓ Enregistré" : "Enregistrer"}
        </Button>
      </div>

      {/* Logo */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Logo du restaurant</h2>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-2xl font-bold">
              {name.charAt(0) || "?"}
            </div>
          )}
          <div>
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {uploading ? "Envoi..." : "Changer le logo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG. Max 2 Mo.</p>
          </div>
        </div>
      </Card>

      {/* Restaurant info */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Informations</h2>
        <Input
          id="name"
          label="Nom du restaurant"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Card>

      {/* Links */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Liens de redirection</h2>
        <Input
          id="google"
          label="Lien Google Avis"
          type="url"
          placeholder="https://g.page/r/..."
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
        />
        <Input
          id="social"
          label="Lien réseau social / feedback"
          type="url"
          placeholder="https://instagram.com/..."
          value={socialUrl}
          onChange={(e) => setSocialUrl(e.target.value)}
        />
      </Card>
    </div>
  );
}
