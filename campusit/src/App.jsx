import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Toaster from "@/components/Toaster";
import { Section, Body } from "@/components/ui/card";
import { U, useApp } from "@/store";
import { useLocal, useTheme } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import HelpCenter from "@/pages/HelpCenter";
import MyTickets from "@/pages/MyTickets";
import TrackTicket from "@/pages/TrackTicket";
import AgentWorkspace from "@/pages/AgentWorkspace";
import SlaMonitor from "@/pages/SlaMonitor";
import Rpa from "@/pages/Rpa";
import Analytics from "@/pages/Analytics";
import Security from "@/pages/Security";
import UsersRoles from "@/pages/UsersRoles";
import Governance from "@/pages/Governance";

function Layout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocal("cit-collapsed", false);
  const [dark, toggleTheme] = useTheme();
  return (
    <div className={cn("grid min-h-screen transition-[grid-template-columns]", collapsed ? "lg:grid-cols-[56px_1fr]" : "lg:grid-cols-[224px_1fr]")}>
      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <Sidebar open={open} collapsed={collapsed} onClose={() => setOpen(false)} />
      <div className="min-w-0">
        <Topbar onMenu={() => setOpen(true)} onCollapse={() => setCollapsed(!collapsed)} collapsed={collapsed} dark={dark} toggleTheme={toggleTheme} />
        <main className="mx-auto flex max-w-[1280px] flex-col gap-4 p-4 lg:p-5"><Outlet /></main>
      </div>
      <Toaster />
    </div>
  );
}

/** RBAC route guard: allowed only if the role is listed AND the permission matrix (feature f) grants it. Denials are audit-logged. */
function Guard({ roles, f, children }) {
  const { role, can, log } = useApp(), { pathname } = useLocation(), ok = roles.includes(role) && can(f);
  useEffect(() => { if (!ok) log(U[role][1], "Opened " + pathname, pathname, "Denied"); }, [ok, pathname]); // eslint-disable-line
  if (ok) return children;
  return (
    <Section title="Access restricted"><Body><p className="flex items-center gap-2 text-mu"><Lock className="size-4" />Your role can’t open this screen. The attempt was logged.</p></Body></Section>
  );
}

export default function App() {
  const { role } = useApp();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={role === "s" ? <HelpCenter /> : <Navigate to="/agent" replace />} />
        <Route path="tickets" element={<Guard roles="s" f={1}><MyTickets /></Guard>} />
        <Route path="tickets/:id" element={<Guard roles="s" f={1}><TrackTicket /></Guard>} />
        <Route path="agent/:id?" element={<Guard roles="tua" f={2}><AgentWorkspace /></Guard>} />
        <Route path="sla" element={<Guard roles="tua" f={2}><SlaMonitor /></Guard>} />
        <Route path="rpa" element={<Guard roles="tua" f={5}><Rpa /></Guard>} />
        <Route path="analytics" element={<Guard roles="tua" f={2}><Analytics /></Guard>} />
        <Route path="security" element={<Guard roles="tua" f={7}><Security /></Guard>} />
        <Route path="governance" element={<Guard roles="tua" f={7}><Governance /></Guard>} />
        <Route path="users" element={<Guard roles="a" f={6}><UsersRoles /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
