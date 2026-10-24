import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProduceListing = Database["public"]["Tables"]["produce_listings"]["Row"];
export type BuyerRequest = Database["public"]["Tables"]["buyer_requests"]["Row"];
export type Offer = Database["public"]["Tables"]["offers"]["Row"];
export type GroupOrder = Database["public"]["Tables"]["group_orders"]["Row"];
export type GroupContribution = Database["public"]["Tables"]["group_contributions"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderEvent = Database["public"]["Tables"]["order_events"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type ListingWithFarmer = ProduceListing & { profiles: Pick<Profile, "id" | "full_name" | "farm_name" | "location"> | null };

export type UserProfile = Profile & { role: string | null };

// ---------- Smart buyer matching (Step 3) ----------

export interface MatchResult {
  listing: ListingWithFarmer;
  score: number;
  reasons: string[];
  quantityCovered: number;
}

function locationOverlap(haystack: string | null, needle: string): boolean {
  if (!haystack) return false;
  const tokens = needle.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 3);
  const hay = haystack.toLowerCase();
  return tokens.some((t) => hay.includes(t));
}

/**
 * Score listings against a buyer request. Filters by crop; scores quantity
 * coverage, price fit, quality grade and location/delivery-area proximity.
 */
export function matchListings(
  listings: ListingWithFarmer[],
  request: Pick<
    BuyerRequest,
    "crop_name" | "quantity" | "max_price_per_unit" | "quality_grade" | "delivery_location"
  >,
): MatchResult[] {
  const crop = request.crop_name.trim().toLowerCase();
  return listings
    .filter(
      (l) =>
        l.crop_name.toLowerCase().includes(crop) &&
        l.availability_status === "available",
    )
    .map((listing) => {
      const reasons: string[] = [];
      let score = 0;

      const coversFull = listing.quantity >= request.quantity;
      if (coversFull) {
        score += 30;
        reasons.push(`Full quantity available (${listing.quantity} kg)`);
      } else {
        score += Math.round(30 * (listing.quantity / request.quantity));
        reasons.push(`Partial: covers ${listing.quantity} of ${request.quantity} kg`);
      }

      if (request.max_price_per_unit != null) {
        if (listing.price_per_unit <= request.max_price_per_unit) {
          score += 20;
          reasons.push("Price within buyer's maximum");
        } else {
          score -= 10;
          reasons.push("Price above buyer's maximum");
        }
      }

      if (
        request.quality_grade &&
        listing.quality_grade &&
        listing.quality_grade.toLowerCase() === request.quality_grade.toLowerCase()
      ) {
        score += 20;
        reasons.push(`Quality matches (${listing.quality_grade})`);
      } else if (request.quality_grade) {
        reasons.push(`Quality differs (${listing.quality_grade})`);
      }

      if (locationOverlap(listing.delivery_areas, request.delivery_location)) {
        score += 20;
        reasons.push("Delivers to buyer's area");
      } else if (locationOverlap(listing.farm_location, request.delivery_location)) {
        score += 10;
        reasons.push("Farmer located near buyer's area");
      } else {
        reasons.push("Different region — transport may cost more");
      }

      if (listing.harvest_date && new Date(listing.harvest_date) >= new Date()) {
        score += 5;
      }

      return {
        listing,
        score,
        reasons,
        quantityCovered: Math.min(listing.quantity, request.quantity),
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ---------- Group selling (Step 5) ----------

export interface GroupPlan {
  contributions: {
    listing: ListingWithFarmer;
    quantity: number;
    pricePerUnit: number;
    farmerId: string;
    farmerName: string;
  }[];
  totalCovered: number;
  shortage: number;
}

/**
 * Build a combined group order from matched listings: top-scored farmers fill
 * the requested quantity (300 + 120 + 80 = 500 kg in the demo scenario).
 */
export function planGroupOrder(
  matches: MatchResult[],
  request: Pick<BuyerRequest, "quantity">,
): GroupPlan {
  let remaining = request.quantity;
  const contributions: GroupPlan["contributions"] = [];
  for (const m of matches) {
    if (remaining <= 0) break;
    const qty = Math.min(m.quantityCovered, remaining);
    contributions.push({
      listing: m.listing,
      quantity: qty,
      pricePerUnit: m.listing.price_per_unit,
      farmerId: m.listing.farmer_id,
      farmerName: m.listing.profiles?.farm_name ?? m.listing.profiles?.full_name ?? "Farmer",
    });
    remaining -= qty;
  }
  return {
    contributions,
    totalCovered: request.quantity - Math.max(remaining, 0),
    shortage: Math.max(remaining, 0),
  };
}

export function groupWeightedPrice(contributions: GroupPlan["contributions"]): number {
  const total = contributions.reduce((s, c) => s + c.quantity, 0);
  if (!total) return 0;
  return contributions.reduce((s, c) => s + c.quantity * c.pricePerUnit, 0) / total;
}

export const currency = (v: number | null | undefined) =>
  v == null ? "—" : `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const num = (v: unknown) => Number(v ?? 0);

// Resolve produce images: bundled demo images by crop, else uploaded image URL.
export function listingImage(listing: { crop_name: string; image_url: string | null }): string {
  return cropImage(listing.crop_name);
}

import heroMarket from "@/assets/hero-market.jpg";
import imgTomatoes from "@/assets/produce-tomatoes.jpg";
import imgOnions from "@/assets/produce-onions.jpg";
import imgPotatoes from "@/assets/produce-potatoes.jpg";
import imgRice from "@/assets/produce-rice.jpg";
import imgCarrots from "@/assets/produce-carrots.jpg";

const CROP_IMAGES: { match: string[]; src: string }[] = [
  { match: ["tomato"], src: imgTomatoes },
  { match: ["onion"], src: imgOnions },
  { match: ["potato", "alu", "aloo"], src: imgPotatoes },
  { match: ["rice", "basmati"], src: imgRice },
  { match: ["carrot"], src: imgCarrots },
];

export function cropImage(cropName: string): string {
  const crop = cropName.toLowerCase();
  for (const entry of CROP_IMAGES) {
    if (entry.match.some((m) => crop.includes(m))) return entry.src;
  }
  return heroMarket;
}

export { heroMarket };
