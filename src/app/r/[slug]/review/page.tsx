"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { isDemo, DEMO_RESTAURANT } from "@/lib/utils";

export default function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [googleUrl, setGoogleUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setGoogleUrl(DEMO_RESTAURANT.google_review_url);
        setSocialUrl(DEMO_RESTAURANT.social_url);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("restaurants")
        .select("google_review_url, social_url")
        .eq("slug", slug)
        .single();

      if (data) {
        setGoogleUrl(data.google_review_url || "");
        setSocialUrl(data.social_url || "");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  function handleYes() {
    if (googleUrl) {
      window.location.href = googleUrl;
    }
  }

  function handleNo() {
    if (socialUrl) {
      window.location.href = socialUrl;
    }
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
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <div className="text-4xl">⭐</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Avez-vous apprécié votre expérience ?
          </h1>
          <p className="text-gray-500">
            Votre avis compte énormément pour nous !
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleYes} className="flex-1 text-base py-4">
            👍 Oui
          </Button>
          <Button onClick={handleNo} variant="outline" className="flex-1 text-base py-4">
            👎 Non
          </Button>
        </div>
      </div>
    </div>
  );
}
