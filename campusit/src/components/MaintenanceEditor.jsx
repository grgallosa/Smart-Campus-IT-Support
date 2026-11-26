import { useState } from "react";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select, Input, Textarea } from "@/components/ui/input";
import { useApp } from "@/store";

/** Technician-approved, simulated asset maintenance. No repair is performed automatically. */
export default function MaintenanceEditor({ ticket }) {
  const { maintenance, recordMaintenance } = useApp();
  const [condition, setCondition] = useState("Under Repair");
  const [action, setAction] = useState("");
  const [cost, setCost] = useState("0");
  const entries = maintenance.filter((m) => m.ticketId === ticket.id);
  return <div className="mt-3 rounded-lg border border-bd bg-b2 p-3">
    <div className="font-semibold">Asset maintenance record · {ticket.assetId}</div>
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <Field label="Updated condition"><Select value={condition} onChange={(e) => setCondition(e.target.value)}>
        {["Operational", "Needs Inspection", "Under Repair", "Out of Service"].map((c) => <option key={c}>{c}</option>)}
      </Select></Field>
      <Field label="Repair expense (PHP)"><Input type="number" min="0" max="1000000" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
    </div>
    <Field label="Technician work completed"><Textarea rows={2} value={action} onChange={(e) => setAction(e.target.value)} placeholder="Example: Replaced damaged keyboard and tested operation" /></Field>
    <Button size="sm" variant="primary" disabled={!action.trim()} onClick={() => { recordMaintenance(ticket.id, { condition, cost, action }); setAction(""); }}>Record approved maintenance</Button>
    {entries.map((e, i) => <div className="mt-2 text-xs text-mu" key={i}>{e.at} · {e.action} · {e.condition} · PHP {e.cost.toLocaleString("en-PH")}</div>)}
  </div>;
}
