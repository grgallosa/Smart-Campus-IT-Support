import * as DM from "@radix-ui/react-dropdown-menu";
import { Bell, LogOut, Menu, Moon, PanelLeft, Search, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NAV } from "@/lib/data";
import { U, isRequester, ownsTicket, useApp } from "@/store";

export default function Topbar({ onMenu, onCollapse, collapsed, dark, toggleTheme }) {
  const { role, signOut, notes, tickets, setGq } = useApp();
  const visibleNotes = isRequester(role) ? notes.filter(n => tickets.some(t => ownsTicket(role, t) && n.includes(t.id))) : notes;
  const nav = useNavigate(), { pathname } = useLocation();
  const [name, roleName] = U[role];
  const here = NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));
  return (
    <header className="sticky top-0 z-10 flex h-[52px] items-center gap-2 border-b border-bd bg-bg px-3 lg:px-5">
      <Button size="icon" className="lg:hidden" aria-label="Open menu" onClick={onMenu}><Menu className="size-4" /></Button>
      <Button size="icon" className="hidden lg:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={onCollapse}><PanelLeft className="size-4" /></Button>
      <div className="min-w-0 flex-1 truncate text-mu">CampusCare AI / <b className="font-medium text-tx">{here?.label || "Help Center"}</b></div>
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-mu" />
        <Input aria-label="Search" className="w-52 pl-8" placeholder="Search tickets and guides..."
          onKeyDown={(e) => { if (e.key === "Enter") { setGq(e.target.value.trim()); nav(isRequester(role) ? "/" : "/agent"); } }} />
      </div>
      <Button size="icon" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} onClick={toggleTheme}>{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
      <DM.Root>
        <DM.Trigger asChild>
          <Button size="icon" className="relative" aria-label={`Notifications (${visibleNotes.length})`}>
            <Bell className="size-4" />
            {visibleNotes.length > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ac px-1 text-[10px] font-semibold text-btt">{visibleNotes.length}</span>}
          </Button>
        </DM.Trigger>
        <DM.Portal>
          <DM.Content align="end" sideOffset={6} className="z-50 w-72 rounded-lg border border-bd bg-sf p-1 shadow-lg">
            {!visibleNotes.length && <p className="px-2 py-2 text-xs text-mu">No notifications.</p>}
            {visibleNotes.map((n, i) => <DM.Item key={i} className="rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-b2">{n}</DM.Item>)}
          </DM.Content>
        </DM.Portal>
      </DM.Root>
      <span className="hidden max-w-32 truncate text-xs font-medium sm:block" title={roleName}>{roleName}</span>
      <Button size="sm" aria-label="Sign out" onClick={() => { signOut(); nav("/", { replace: true }); }}><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></Button>
      <span title={`${name} · ${roleName}`} className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-bd bg-b2 text-[11px] font-semibold sm:flex">
        {name.split(" ").map((w) => w[0]).join("")}
      </span>
    </header>
  );
}
