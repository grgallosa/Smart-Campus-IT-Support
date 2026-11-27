import { useApp } from "@/store";
import { cn } from "@/lib/utils";

export default function Toaster() {
  const { msg } = useApp();
  return (
    <div role="status" className={cn("pointer-events-none fixed bottom-4 right-4 z-[60] rounded-md border border-[#3F3F46] bg-[#27272A] px-3 py-2 text-white transition-all", msg ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
      {msg}
    </div>
  );
}
