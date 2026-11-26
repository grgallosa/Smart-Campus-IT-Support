import { Link } from "react-router-dom";
import { Monitor, Printer, Projector, Wallet } from "lucide-react";
import { Section, Body } from "@/components/ui/card";
import { ASSETS } from "./QrReport";
import { useApp } from "@/store";

/** Demo equipment history derives directly from the same incident store used by the agent workspace. */
export default function Assets() {
  const { tickets, maintenance } = useApp();
  const money = value => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
  const total = ASSETS.reduce((sum, asset) => sum + asset.cost, 0) + maintenance.reduce((sum, entry) => sum + entry.cost, 0);
  return <>
    <div><h1>Equipment and maintenance</h1><p className="text-mu">QR-linked asset records, incident frequency and illustrative repair expenses.</p></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Equipment records",ASSETS.length],["Active incident assets",new Set(tickets.filter(t=>t.assetId && t.st!=="Resolved").map(t=>t.assetId)).size],["Needs attention",ASSETS.filter(a=>(maintenance.find(m=>m.assetId===a.id)?.condition || a.condition)!=="Operational").length],["Recorded repair cost",money(total)]].map(([k,v])=><div key={k} className="rounded-lg border border-bd bg-sf p-4"><div className="text-xs text-mu">{k}</div><div className="mt-1 text-xl font-semibold">{v}</div></div>)}
    </div>
    <Section title="Registered equipment"><Body>
      <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Asset ID</th><th>Equipment</th><th>Location</th><th>Condition</th><th>Tickets</th><th>Repair count</th><th>Repair cost</th></tr></thead><tbody>
      {ASSETS.map(a => <tr key={a.id}><td className="font-semibold">{a.id}</td><td>{a.type}</td><td>{a.room}</td><td>{maintenance.find(m=>m.assetId===a.id)?.condition || a.condition}</td><td>{tickets.filter(t=>t.assetId===a.id).length}</td><td>{a.repairs + maintenance.filter(m=>m.assetId===a.id).length}</td><td>{money(a.cost + maintenance.filter(m=>m.assetId===a.id).reduce((s,m)=>s+m.cost,0))}</td></tr>)}
      </tbody></table></div>
    </Body></Section>
    <Section title="Recent technician-approved maintenance"><Body className="gap-2">
      {maintenance.length ? maintenance.map((m,i)=><p key={i} className="border-b border-bd py-2">{m.at} · <b>{m.assetId}</b> · {m.action} · {m.condition} · {money(m.cost)} · {m.technician}</p>) : <p className="text-mu">No new maintenance recorded during this demo session.</p>}
    </Body></Section>
    <Section title="Interpretation and upgrade considerations"><Body className="gap-2"><p>These costs and repair counts are demonstration data, not verified university expenses. An asset with repeated incidents should be inspected before a repair-or-replace decision.</p><p className="text-mu">For a production system, each repair entry would require authorization, date, parts, labor cost, warranty status, and a documented technician decision.</p><Link className="text-acx hover:underline" to="/report?asset=PC-024">Open example QR incident form for PC-024</Link></Body></Section>
  </>;
}
