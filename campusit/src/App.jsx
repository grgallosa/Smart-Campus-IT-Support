import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Toaster from "@/components/Toaster";
import { Section, Body } from "@/components/ui/card";
import { isRequester, useApp } from "@/store";
import Login from "@/pages/Login";
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
import QrReport from "@/pages/QrReport";
import Assets from "@/pages/Assets";

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

/** RBAC route guard: roles are s (student), t (Tier 1), u (Tier 2), a (admin). */
function Guard({ roles, children }) {
  const { role, deny } = useApp();
  const { pathname } = useLocation();
  const allowed = roles.includes(role);
  useEffect(() => { if (!allowed) deny(pathname); }, [allowed, pathname, role]);
  if (allowed) return children;
  return (
    <Section title="Access restricted"><Body><p className="flex items-center gap-2 text-mu"><Lock className="size-4" />Your role can’t open this screen. Sign out and choose an authorized demo account.</p></Body></Section>
  );
}

export default function App() {
  const { role } = useApp();
  if (!role) return <Login />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={isRequester(role) ? <HelpCenter /> : <Navigate to="/agent" replace />} />
        <Route path="tickets" element={<Guard roles="sf"><MyTickets /></Guard>} />
        <Route path="report" element={<Guard roles="sf"><QrReport /></Guard>} />
        <Route path="assets" element={<Guard roles="tua"><Assets /></Guard>} />
        <Route path="tickets/:id" element={<Guard roles="sf"><TrackTicket /></Guard>} />
        <Route path="agent/:id?" element={<Guard roles="tua"><AgentWorkspace /></Guard>} />
        <Route path="sla" element={<Guard roles="tua"><SlaMonitor /></Guard>} />
        <Route path="rpa" element={<Guard roles="ua"><Rpa /></Guard>} />
        <Route path="analytics" element={<Guard roles="tua"><Analytics /></Guard>} />
        <Route path="security" element={<Guard roles="ua"><Security /></Guard>} />
        <Route path="users" element={<Guard roles="a"><UsersRoles /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
