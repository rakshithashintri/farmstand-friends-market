import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  // Offers
  pending: "bg-yellow-100 text-yellow-900 border-yellow-200",
  accepted: "bg-green-100 text-green-900 border-green-200",
  counteroffer: "bg-amber-100 text-amber-900 border-amber-200",
  rejected: "bg-red-100 text-red-900 border-red-200",
  withdrawn: "bg-stone-100 text-stone-700 border-stone-200",
  converted: "bg-blue-100 text-blue-900 border-blue-200",
  // Group orders / contributions
  proposed: "bg-blue-100 text-blue-900 border-blue-200",
  all_confirmed: "bg-green-100 text-green-900 border-green-200",
  confirmed: "bg-green-100 text-green-900 border-green-200",
  declined: "bg-red-100 text-red-900 border-red-200",
  // Requests
  inquiry: "bg-stone-100 text-stone-700 border-stone-200",
  matching: "bg-blue-100 text-blue-900 border-blue-200",
  quotation: "bg-amber-100 text-amber-900 border-amber-200",
  confirmation: "bg-purple-100 text-purple-900 border-purple-200",
  preparation: "bg-amber-100 text-amber-900 border-amber-200",
  fulfilled: "bg-green-100 text-green-900 border-green-200",
  cancelled: "bg-stone-200 text-stone-800 border-stone-300",
  // Order lifecycle
  dispatched: "bg-blue-100 text-blue-900 border-blue-200",
  delivered: "bg-teal-100 text-teal-900 border-teal-200",
  completed: "bg-green-100 text-green-900 border-green-200",
  // Listings
  available: "bg-green-100 text-green-900 border-green-200",
  reserved: "bg-amber-100 text-amber-900 border-amber-200",
  sold_out: "bg-stone-200 text-stone-800 border-stone-300",
  inactive: "bg-stone-200 text-stone-800 border-stone-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  return (
    <Badge variant="outline" className={cn("font-semibold", STYLES[status] ?? "bg-muted", className)}>
      {label}
    </Badge>
  );
}
