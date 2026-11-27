import { LIFECYCLE, LIFE_IDX } from "@/lib/data";
import { Chip } from "./Badges";
import { cn } from "@/lib/utils";

/** New → Triaged → Assigned → In Progress → (Escalated) → Resolved → Closed */
export default function Lifecycle({ status }) {
  const ci = LIFE_IDX[status] ?? 2;
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {LIFECYCLE.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && <span className="text-mu">›</span>}
          <Chip className={cn(i === ci && "border-ac text-acx", i > ci && "opacity-45", i === 4 && i !== ci && "opacity-45")}>{i < ci && i !== 4 ? "✓ " : ""}{n}</Chip>
        </span>
      ))}
    </div>
  );
}
