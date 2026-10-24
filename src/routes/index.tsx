import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Handshake, LineChart, PackageSearch, Sprout, Store, Tractor, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { ListingWithFarmer } from "@/lib/marketplace";
import { currency, listingImage, heroMarket } from "@/lib/marketplace";

const STEPS = [
  { n: 1, title: "Farmer registers", desc: "Farmers sign up with name, phone, location and manage their profile." },
  { n: 2, title: "Farmer lists produce", desc: "Crop, quantity, price, grade, harvest date, location and photos." },
  { n: 3, title: "Smart buyer matching", desc: "Buyer requirements are matched with listings by crop, quantity, grade, price and location." },
  { n: 4, title: "Compare net earnings", desc: "Farmers see estimated costs and net earnings: Total − Transport − Other costs." },
  { n: 5, title: "Group selling", desc: "When one farmer can't fill the order, compatible farmers combine their contributions." },
  { n: 6, title: "Confirmation", desc: "Buyer and farmers accept or counter the offer — the order confirms only when all agree." },
  { n: 7, title: "Delivery & completion", desc: "Track preparation, dispatch, delivery and confirm receipt with a full transaction history." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FarmBridge — Farmer Marketplace Platform" },
      { name: "description", content: "Connect farmers directly with bulk buyers: list produce, smart matching, group selling, offer negotiation and delivery tracking." },
      { property: "og:title", content: "FarmBridge — Farmer Marketplace Platform" },
      { property: "og:description", content: "Connect farmers directly with bulk buyers — transparent pricing, group orders and delivery tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [featured, setFeatured] = useState<ListingWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("produce_listings")
      .select("*, profiles!produce_listings_farmer_id_fkey(id, full_name, farm_name, location)")
      .eq("availability_status", "available")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setFeatured((data ?? []) as ListingWithFarmer[]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroMarket} alt="" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 lg:py-32">
          <Badge className="bg-accent text-accent-foreground">Demonstration marketplace</Badge>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-primary-foreground lg:text-5xl">
            Connecting farmers directly with bulk buyers
          </h1>
          <p className="max-w-xl text-lg text-primary-foreground/90">
            Better prices for farmers, transparent sourcing for retailers, wholesalers and
            restaurants — no intermediaries.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth" search={{ mode: "register" }}>
                <Tractor className="mr-2 size-5" /> Join as Farmer
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" asChild>
              <Link to="/auth" search={{ mode: "register" }}>
                <Store className="mr-2 size-5" /> Join as Bulk Buyer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            { icon: Users, label: "Verified farmers & buyers" },
            { icon: PackageSearch, label: "Live produce listings" },
            { icon: Handshake, label: "Negotiated offers" },
            { icon: LineChart, label: "Transparent net earnings" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <s.icon className="size-5 text-primary" />
              </span>
              <span className="text-sm font-semibold text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured produce */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Featured produce</h2>
            <p className="text-sm text-muted-foreground">Fresh listings from verified farmers (demonstration data).</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/auth">
              Browse all <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Loading produce…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <Card key={l.id} className="overflow-hidden pt-0">
                <img src={listingImage(l)} alt={l.crop_name} className="h-44 w-full object-cover" loading="lazy" width={1024} height={768} />
                <CardContent className="space-y-1.5 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">{l.crop_name}</h3>
                    <Badge variant="outline">{l.quality_grade}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {l.profiles?.farm_name ?? l.profiles?.full_name} · {l.farm_location}
                  </p>
                  <p className="font-semibold text-primary">
                    {currency(l.price_per_unit)}/{l.unit}{" "}
                    <span className="font-normal text-muted-foreground">· {l.quantity} {l.unit} available</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Workflow */}
      <section className="bg-secondary/60 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center gap-3">
            <Workflow className="size-6 text-primary" />
            <h2 className="font-display text-2xl font-bold">How the marketplace works</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <Card key={s.n} className="border-none shadow-sm">
                <CardContent className="space-y-2 pt-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{s.n}</span>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-primary/30 bg-primary text-primary-foreground">
              <CardContent className="flex h-full flex-col items-start justify-center gap-3 pt-5">
                <Sprout className="size-8" />
                <p className="font-display text-lg font-bold">Ready to try it?</p>
                <p className="text-sm opacity-80">Sign in with a demonstration account and walk through all seven steps.</p>
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/auth">Explore the demo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
