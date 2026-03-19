"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QRCodePage() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const funnelUrl = `${baseUrl}/r/${slug}`;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("restaurants")
        .select("slug, name")
        .eq("id", user.id)
        .single();

      if (data) {
        setSlug(data.slug);
        setName(data.name);
      }
      setLoading(false);
    }
    load();
  }, []);

  function downloadQR() {
    const svg = document.getElementById("leadzy-qr");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(0, 0, 1024, 1024);
      ctx!.drawImage(img, 0, 0, 1024, 1024);

      const link = document.createElement("a");
      link.download = `leadzy-qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
      <div>
        <h1 className="text-2xl font-bold">QR Code</h1>
        <p className="text-gray-500">Partagez ce QR code dans votre restaurant</p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-8">
        <div className="rounded-2xl bg-white p-4 shadow-md border border-gray-100">
          <QRCodeSVG
            id="leadzy-qr"
            value={funnelUrl}
            size={256}
            level="H"
            includeMargin
            fgColor="#1e293b"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-400 break-all">{funnelUrl}</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={downloadQR}>
            Télécharger PNG
          </Button>
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(funnelUrl)}
          >
            Copier le lien
          </Button>
        </div>
      </Card>
    </div>
  );
}
