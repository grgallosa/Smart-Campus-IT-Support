import { useNow } from "@/lib/hooks";
import { M, H } from "@/lib/data";
import { cn } from "@/lib/utils";

const p2 = (n) => String(n).padStart(2, "0");
export const fmt = (d, long) => {
  const h = Math.floor(d / H), m = Math.floor((d % H) / M), s = Math.floor((d % M) / 1e3);
  return long ? `${p2(h)}:${p2(m)}:${p2(s)}` : h ? `${h}h ${p2(m)}m` : `${m}m`;
};
/** At risk = under 25% of the target time left (overdue is counted separately as Breached). */
export const isRisk = (end, total, now = Date.now()) => { const d = end - now; return d >= 0 && d < (total ? total * 0.25 : 30 * M); };
export const health = (end, total) => (end < Date.now() ? "Breached" : isRisk(end, total) ? "At Risk" : "Healthy");

/** Live countdown. Amber when under 25% of the target remains (▲), red when overdue. */
export function Sla({ end, total, long }) {
  const now = useNow(), d = end - now, over = d < 0, risk = isRisk(end, total, now);
  return <b className={cn("font-semibold", over && "text-er", risk && "text-wr", long && "text-lg")}>{over ? "Overdue" : (risk ? "▲ " : "") + fmt(d, long)}</b>;
}
export function SlaBar({ end, total }) {
  const now = useNow(), d = end - now, f = Math.max(0, Math.min(1, d / total));
  return (
    <div className="h-1 min-w-12 flex-1 overflow-hidden rounded bg-b2">
      <div className={cn("h-full rounded transition-all", d < 0 ? "bg-er" : isRisk(end, total, now) ? "bg-wr" : "bg-tx")} style={{ width: f * 100 + "%" }} />
    </div>
  );
}
export function Health({ end, total }) {
  useNow();
  const h = health(end, total);
  return <span className={h === "Breached" ? "text-er" : h === "At Risk" ? "text-wr" : "text-ok"}>{h}</span>;
}
