export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const isDemo =
  typeof window !== "undefined" &&
  (process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL);

export const DEMO_RESTAURANT = {
  id: "demo-id",
  name: "Le Petit Bistrot",
  slug: "demo",
  logo_url: "",
  google_review_url: "https://google.com",
  social_url: "https://instagram.com",
};

export const DEMO_REWARDS = [
  { id: "1", label: "-10% sur l'addition", probability: 0.3, color: "#6366f1" },
  { id: "2", label: "Dessert offert", probability: 0.25, color: "#f59e0b" },
  { id: "3", label: "Café offert", probability: 0.25, color: "#10b981" },
  { id: "4", label: "-20% sur l'addition", probability: 0.1, color: "#ef4444" },
  { id: "5", label: "Apéritif offert", probability: 0.05, color: "#8b5cf6" },
  { id: "6", label: "Tentez encore !", probability: 0.05, color: "#64748b" },
];

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
