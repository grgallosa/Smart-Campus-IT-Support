import { Section } from "@/components/ui/card";
import { Metrics, BarList } from "@/components/Metrics";
import { PriorityBadge } from "@/components/Badges";
import { Health, Sla, SlaBar, isRisk } from "@/components/Sla";
import { IMP, isDone, MX, RSX, RTX } from "@/lib/data";
import { useApp } from "@/store";

const group = (rows, key) => { const o = {}; rows.forEach((t) => { o[t[key]] = (o[t[key]] || 0) + 1; }); return Object.entries(o); };

export default function SlaMonitor() {
  const { tickets } = useApp(), open = tickets.filter((t) => !isDone(t)), now = Date.now();
  return (
    <>
      <div><h1>SLA Monitor</h1><p className="text-mu">Targets by priority and ticket.</p></div>
      <Metrics items={[1, 2, 3, 4].map((p) => [<PriorityBadge key={p} p={p} />, open.filter((t) => t.p === p).length])} />
      <Metrics items={[["SLA Met", "94%"], ["At Risk", open.filter((t) => isRisk(t.end, t.tot)).length], ["Breached", open.filter((t) => t.end < now).length], ["Avg Response", "12m"], ["Avg Resolution", "2h 36m"]]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Priority matrix · impact × urgency">
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Impact / Urgency</th><th>High</th><th>Medium</th><th>Low</th></tr></thead>
            <tbody>{IMP.map((n, i) => <tr key={n}><td>{n}</td>{MX[i].map((p, j) => <td key={j}><PriorityBadge p={p} short /></td>)}</tr>)}</tbody></table></div>
        </Section>
        <Section title="SLA targets and routing">
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Priority</th><th>Response</th><th>Resolution</th><th>Clock</th><th>Routes to</th></tr></thead>
            <tbody>{[1, 2, 3, 4].map((p) => <tr key={p}><td><PriorityBadge p={p} /></td><td>{RTX[p - 1]}</td><td>{RSX[p - 1]}</td><td className="text-mu">24×7</td><td>{p < 3 ? "Tier 2" : "Tier 1"}</td></tr>)}</tbody></table></div>
          <p className="px-4 py-2 text-xs text-mu">Priority comes from impact × urgency. Escalation moves ownership but never changes priority. If priority is re-rated, the SLA is recalculated from ticket creation. At risk = under 25% of the target time left.</p>
        </Section>
      </div>
      <Section>
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Ticket</th><th>Priority</th><th>Remaining</th><th className="w-1/3">Progress</th><th>Health</th></tr></thead>
          <tbody>{open.map((t) => <tr key={t.id}><td>{t.id}</td><td><PriorityBadge p={t.p} short /></td><td><Sla end={t.end} total={t.tot} /></td><td><div className="flex"><SlaBar end={t.end} total={t.tot} /></div></td><td><Health end={t.end} total={t.tot} /></td></tr>)}</tbody></table></div>
      </Section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Agent workload"><BarList rows={group(open, "as")} /></Section>
        <Section title="Open tickets by category"><BarList rows={group(open, "cat")} /></Section>
      </div>
    </>
  );
}
