import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PC, PL } from "@/lib/data";

export const Chip = ({ c, children, className }) => (
  <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-bd bg-sf px-2 py-px text-xs font-medium", className)}>
    {c && <i className="size-1.5 rounded-full" style={{ background: c }} />}{children}
  </span>
);
export const PriorityBadge = ({ p, short }) => <Chip c={PC[p]}>{short ? `P${p}` : `P${p} · ${PL[p]}`}</Chip>;
const SC = { Resolved: "#16A34A", Closed: "#71717A", Escalated: "#D97706", New: "#A1A1AA", Open: "#A1A1AA", Submitted: "#A1A1AA" };
export const StatusBadge = ({ s }) => <Chip c={SC[s] || "#2563EB"}>{s}</Chip>;
/** AI content is always labelled and uses the brand blue. */
export const AiBadge = ({ children = "AI" }) => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-ac bg-acs px-2 py-px text-xs font-medium text-acx">
    <Sparkles className="size-3" />{children}
  </span>
);
