import { cn } from "@/lib/utils";

/** Bordered section with an optional header row. Prefer borders over shadows. */
export const Section = ({ title, action, children, className }) => (
  <section className={cn("min-w-0 rounded-lg border border-bd bg-sf", className)}>
    {title && (
      <div className="flex items-center justify-between gap-2 border-b border-bd px-4 py-2">
        <h3 className="text-sm font-semibold">{title}</h3>{action}
      </div>
    )}
    {children}
  </section>
);
export const Body = ({ className, ...p }) => <div className={cn("flex flex-col gap-2 px-4 py-3", className)} {...p} />;
