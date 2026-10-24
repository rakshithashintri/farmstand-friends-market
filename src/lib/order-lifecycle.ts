// Order lifecycle: stage model, stage matrix (who can do what at each stage)
// and transition validation shared by all order views.

export const ORDER_STAGES = [
  { key: "inquiry", label: "Inquiry" },
  { key: "matching", label: "Matching" },
  { key: "quotation", label: "Quotation" },
  { key: "confirmation", label: "Confirmation" },
  { key: "preparation", label: "Preparation" },
  { key: "dispatched", label: "Dispatch" },
  { key: "delivered", label: "Delivery" },
  { key: "completed", label: "Completion" },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["key"] | "cancelled";

export const ORDER_STAGE_KEYS = ORDER_STAGES.map((s) => s.key);

export type Actor = "buyer" | "farmer" | "admin";

export type OrderAction =
  | "find_matches"
  | "view_matches"
  | "send_quotation"
  | "accept_offer"
  | "counter_offer"
  | "reject_offer"
  | "confirm_order"
  | "mark_dispatched"
  | "mark_delivered"
  | "confirm_receipt"
  | "cancel_order"
  | "add_note";

interface StageRow {
  buyer: OrderAction[];
  farmer: OrderAction[];
  admin: OrderAction[];
}

// Stage matrix — enforced in the order view: actions shown per role per stage.
export const STAGE_ACTIONS: Record<OrderStage, StageRow> = {
  inquiry: {
    buyer: ["find_matches", "cancel_order"],
    farmer: [],
    admin: ["cancel_order"],
  },
  matching: {
    buyer: ["view_matches"],
    farmer: ["send_quotation"],
    admin: [],
  },
  quotation: {
    buyer: ["accept_offer", "counter_offer", "reject_offer"],
    farmer: ["accept_offer", "counter_offer", "reject_offer"],
    admin: [],
  },
  confirmation: {
    buyer: ["confirm_order"],
    farmer: ["confirm_order"],
    admin: [],
  },
  preparation: {
    buyer: [],
    farmer: ["mark_dispatched"],
    admin: [],
  },
  dispatched: {
    buyer: [],
    farmer: ["mark_delivered"],
    admin: [],
  },
  delivered: {
    buyer: ["confirm_receipt"],
    farmer: [],
    admin: [],
  },
  completed: {
    buyer: [],
    farmer: [],
    admin: [],
  },
  cancelled: {
    buyer: [],
    farmer: [],
    admin: [],
  },
};

// Allowed lifecycle transitions (validated client-side; data is RLS-protected).
const TRANSITIONS: Record<OrderStage, OrderStage[]> = {
  inquiry: ["matching", "quotation", "cancelled"],
  matching: ["quotation", "cancelled"],
  quotation: ["confirmation", "cancelled"],
  confirmation: ["preparation", "cancelled"],
  preparation: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStage, to: OrderStage): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function actionsFor(stage: OrderStage, actor: Actor): OrderAction[] {
  return STAGE_ACTIONS[stage]?.[actor] ?? [];
}

export function hasAction(
  stage: OrderStage,
  actor: Actor,
  action: OrderAction,
): boolean {
  return actionsFor(stage, actor).includes(action);
}

export function stageIndex(stage: OrderStage): number {
  return ORDER_STAGE_KEYS.indexOf(stage as (typeof ORDER_STAGES)[number]["key"]);
}

export function stageLabel(stage: string): string {
  const found = ORDER_STAGES.find((s) => s.key === stage);
  if (found) return found.label;
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function computeNetEarnings(
  quantity: number,
  pricePerUnit: number,
  transportCost: number,
  otherSellingCost: number,
): { total: number; net: number } {
  const total = quantity * pricePerUnit;
  const net = total - transportCost - otherSellingCost;
  return { total, net };
}
