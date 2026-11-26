import { NavLink } from "react-router-dom";
import { BarChart3, Bot, Headset, LifeBuoy, MonitorCheck, ShieldCheck, Timer, Ticket, UserCog, QrCode, Boxes } from "lucide-react";
import { NAV } from "@/lib/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

const ICONS = { BarChart3, Bot, Headset, LifeBuoy, ShieldCheck, Timer, Ticket, UserCog, QrCode, Boxes };

/** Role-based sidebar: items a role can't use are hidden, not locked. Drawer on mobile, rail when collapsed. */
export default function Sidebar({ open, collapsed, onClose }) {
  const { role } = useApp();
  const items = NAV.filter((n) => n.roles.includes(role));
  let prev;
  return (
    <nav aria-label="Main" className={cn(
      "fixed inset-y-0 left-0 z-30 flex w-64 -translate-x-full flex-col gap-0.5 overflow-y-auto border-r border-bd bg-sbg p-3 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0",
      open && "translate-x-0", collapsed && "lg:items-center lg:px-2")}>
      <div className="flex items-center gap-2 px-2 pb-3 pt-1.5 font-semibold">
        <MonitorCheck className="size-5 shrink-0 text-ac" aria-hidden="true" /><span className={cn(collapsed && "lg:hidden")}>CampusCare AI</span>
      </div>
      {items.map((n) => {
        const Icon = ICONS[n.icon], head = n.group && n.group !== prev; prev = n.group;
        return (
          <div key={n.to} className="contents">
            {head && (collapsed
              ? <hr className="my-2 hidden w-6 border-bd lg:block" />
              : <h6 className="mx-2 mb-1 mt-3 text-[11px] font-medium uppercase tracking-wide text-mu">{n.group}</h6>)}
            <NavLink to={n.to} end={n.to === "/"} onClick={onClose} title={n.label}
              className={({ isActive }) => cn("flex h-8 items-center gap-2 rounded-md px-2 hover:bg-b2", isActive && "bg-acs font-semibold text-acx", collapsed && "lg:w-9 lg:justify-center lg:px-0")}>
              <Icon className="size-4 shrink-0" /><span className={cn(collapsed && "lg:hidden")}>{n.label}</span>
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}
