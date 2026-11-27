import { cn } from "@/lib/utils";

/** Compact metric row (replaces large KPI cards). */
export const Metrics = ({ items }) => (
  <div className="flex flex-wrap rounded-lg border border-bd bg-sf">
    {items.map(([l, v], i) => (
      <div key={l} className={cn("min-w-[130px] flex-1 px-4 py-3", i > 0 && "border-l border-bd")}>
        <div className="text-xs text-mu">{l}</div>
        <div className="text-xl font-semibold tracking-tight">{v}</div>
      </div>
    ))}
  </div>
);
export const BarList = ({ rows }) => {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {rows.map(([l, n, label]) => (
        <div key={l} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-mu">{l}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded bg-b2"><div className="h-full rounded bg-tx" style={{ width: (n / max) * 100 + "%" }} /></div>
          <b className="w-10 text-right">{label ?? n}</b>
        </div>
      ))}
    </div>
  );
};
