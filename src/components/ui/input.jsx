import { cn } from "@/lib/utils";

const base = "h-8 w-full rounded-md border border-bd2 bg-sf px-2.5 text-[13px] text-tx outline-ac placeholder:text-mt focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1";
export const Input = ({ className, ...p }) => <input className={cn(base, className)} {...p} />;
export const Select = ({ className, ...p }) => <select className={cn(base, "pr-6", className)} {...p} />;
export const Textarea = ({ className, ...p }) => <textarea className={cn(base, "h-auto py-2", className)} {...p} />;
export const Field = ({ label, children, className }) => (
  <label className={cn("flex flex-col gap-1 text-xs font-medium text-mu", className)}>{label}{children}</label>
);
