import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { AiBadge, Chip, PriorityBadge, StatusBadge } from "@/components/Badges";
import { Sla, SlaBar } from "@/components/Sla";
import { Metrics } from "@/components/Metrics";
import Lifecycle from "@/components/Lifecycle";
import MaintenanceEditor from "@/components/MaintenanceEditor";
import AiPanel from "@/components/AiPanel";
import { IMP, M, RT, URG } from "@/lib/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

/** Three columns: Queue | Ticket | SLA + AI Agent-Assist. Selected ticket lives in the URL (/agent/:id). */
export default function AgentWorkspace() {
  const { tickets, gq } = useApp(), { id } = useParams();
  const open = tickets.filter((t) => t.st !== "Resolved");
  const sel = tickets.find((t) => t.id === id) || tickets.find((t) => t.id === "CIT-2026-1042") || tickets[0];
  return (
    <>
      <Metrics items={[["Open Tickets", open.length], ["P1/P2 Tickets", open.filter((t) => t.p < 3).length], ["SLA At Risk", open.filter((t) => t.end - Date.now() < 30 * M).length], ["Resolved Today", 31 + tickets.length - open.length], ["Avg Resolution", "2h 18m"]]} />
      <div className="grid items-start gap-4 lg:grid-cols-[264px_1fr] xl:grid-cols-[288px_1fr_316px]">
        <Queue rows={[...open].sort((a, b) => a.p - b.p || a.end - b.end)} selId={sel.id} initial={gq} />
        <TicketPanel t={sel} />
        <div className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1"><SidePanel t={sel} /></div>
      </div>
    </>
  );
}

function Queue({ rows, selId, initial }) {
  const [q, setQ] = useState(initial), [p, setP] = useState(""), [s, setS] = useState("");
  useEffect(() => setQ(initial), [initial]);
  const list = rows.filter((t) => (!q || (t.id + t.issue + t.who).toLowerCase().includes(q.toLowerCase())) && (!p || "P" + t.p === p) && (!s || t.st === s));
  return (
    <Section>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex gap-2">
          <Input aria-label="Search tickets" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select aria-label="Priority" className="w-24" value={p} onChange={(e) => setP(e.target.value)}><option value="">Priority</option>{[1, 2, 3, 4].map((n) => <option key={n}>P{n}</option>)}</Select>
        </div>
        <Select aria-label="Status" value={s} onChange={(e) => setS(e.target.value)}><option value="">All statuses</option>{["New", "Assigned", "In Progress", "Escalated"].map((x) => <option key={x}>{x}</option>)}</Select>
      </div>
      {list.map((t) => (
        <Link key={t.id} to={`/agent/${t.id}`} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-bd px-3 py-2.5 hover:bg-b2", t.id === selId && "bg-acs")}>
          <PriorityBadge p={t.p} short />
          <span className="min-w-0 truncate"><b>{t.id.slice(5)}</b> <span className="text-mu">{t.issue}</span></span>
          <Sla end={t.end} />
        </Link>
      ))}
      {!list.length && <p className="border-t border-bd px-3 py-3 text-mu">No tickets match.</p>}
    </Section>
  );
}

function TicketPanel({ t }) {
  const { genSummary, saveSummary, addNote } = useApp();
  const [note, setNote] = useState(""), [edit, setEdit] = useState(false), [sv, setSv] = useState("");
  const s = t.sum;
  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bd px-4 py-3">
        <div><h2 className="text-base font-semibold">{t.issue}</h2><p className="text-xs text-mu">{t.id} · {t.who}</p></div>
        <div className="flex flex-wrap items-center gap-2"><PriorityBadge p={t.p} /><StatusBadge s={t.st} /><Button size="sm" onClick={() => genSummary(t.id)}>Generate summary</Button></div>
      </div>
      {s && (
        <div className="px-4 pt-3">
          <div className="flex flex-col gap-1 rounded-lg border border-bd bg-b2 p-3">
            <div><AiBadge>AI summary · review before saving</AiBadge></div>
            <p><b>Issue:</b> {s.issue}</p><p><b>Troubleshooting performed:</b> {s.tshoot}</p><p><b>Resolution:</b> {s.resolution}</p>
            <p><b>Sentiment:</b> {s.sentiment}</p><p><b>Follow-up:</b> {s.follow}</p><p><b>Suggested note:</b> {s.note}</p>
            <div className="mt-1 flex gap-2">
              <Button size="sm" onClick={() => { setSv(s.issue); setEdit(true); }}>Edit</Button>
              <Button size="sm" variant="primary" onClick={() => saveSummary(t.id, {})}>{s.saved ? "Saved" : "Save"}</Button>
            </div>
          </div>
          <Dialog open={edit} onOpenChange={setEdit}>
            <DialogContent title="Edit summary">
              <Textarea rows={4} value={sv} onChange={(e) => setSv(e.target.value)} />
              <div className="mt-3 flex gap-2">
                <Button variant="primary" onClick={() => { saveSummary(t.id, { issue: sv }); setEdit(false); }}>Save</Button>
                <DialogClose asChild><Button>Cancel</Button></DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className="px-4 pt-3"><Lifecycle status={t.st} /></div>
      <Tabs defaultValue="d" key={t.id} className="mt-2">
        <TabsList>{[["d", "Description"], ["c", "Conversation"], ["n", "Notes"], ["a", "Activity"]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList>
        <TabsContent value="d"><Body>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div><div className="text-xs text-mu">Requester</div>{t.who}</div><div><div className="text-xs text-mu">Assigned</div>{t.as}</div>
            <div><div className="text-xs text-mu">Location</div>{t.loc}</div>
            <div><div className="text-xs text-mu">Contact</div>g••••••@student.edu <Chip c="#16A34A">PII Protected</Chip></div>
          </div>
          {t.assetId && <div className="rounded-lg border border-ac/40 bg-b2 p-3"><b>Equipment QR report</b><p>Asset: {t.assetId} · {t.assetType} · {t.loc}</p>{t.exam && <p className="text-wr">Exam/defense flag: validate academic urgency before applying priority exceptions.</p>}{t.parentId && <p>Related incident group: {t.parentId}</p>}</div>}
          {t.assetId && <MaintenanceEditor ticket={t} />}
          <p>{t.desc}</p>{!t.assetId && <p className="text-xs text-mu">Attachment: wifi-error.png</p>}
        </Body></TabsContent>
        <TabsContent value="c"><Body>{t.msgs.map((m, i) => <p key={i}><b>{m[0]}</b> <span className="text-xs text-mu">{m[1]}</span><br />{m[2]}</p>)}{!t.msgs.length && <p className="text-mu">No messages yet.</p>}</Body></TabsContent>
        <TabsContent value="n"><Body>
          {t.notes.map((n, i) => <p key={i} className="rounded-lg border border-bd bg-b2 p-2">{n}</p>)}{!t.notes.length && <p className="text-mu">No notes.</p>}
          <div className="flex gap-2"><Input aria-label="Internal note" placeholder="Add internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
            <Button onClick={() => { if (note.trim()) { addNote(t.id, note.trim()); setNote(""); } }}>Add</Button></div>
        </Body></TabsContent>
        <TabsContent value="a"><Body className="gap-0">{t.act.map((a, i) => <p key={i} className="border-l border-bd2 pb-3 pl-4"><span className="text-xs text-mu">{a[0]}</span> {a[1]}</p>)}</Body></TabsContent>
      </Tabs>
    </Section>
  );
}

/** Escalation rule: Tier 1 → Tier 2 when impact is broad, half the resolution time is gone, or elevated access is needed. */
function SidePanel({ t }) {
  const { role, rerate, escalate, toggleElev, resolve, triggerRpa } = useApp(), nav = useNavigate();
  const res = t.st === "Resolved", tier2 = "ua".includes(role);
  const crit = [["Impact is department, building or campus", t.imp < 2], ["Half the resolution time used", (Date.now() - t.t0) / (t.end - t.t0) >= 0.5], ["Needs elevated access", t.elev]];
  return (
    <>
      <Section title="SLA">
        <Body className="gap-2">
          <div className="flex items-center justify-between"><span className="text-mu">Response</span>{t.resp ? <b className="text-ok">Responded</b> : <Sla end={t.rend} long />}</div>
          {!t.resp && <SlaBar end={t.rend} total={RT[t.p]} />}
          <div className="flex items-center justify-between"><span className="text-mu">Resolution</span><Sla end={t.end} long /></div>
          <SlaBar end={t.end} total={t.tot} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Impact"><Select value={t.imp} onChange={(e) => rerate(t.id, +e.target.value, t.urg)}>{IMP.map((n, i) => <option key={n} value={i}>{n}</option>)}</Select></Field>
            <Field label="Urgency"><Select value={t.urg} onChange={(e) => rerate(t.id, t.imp, +e.target.value)}>{URG.map((n, i) => <option key={n} value={i}>{n}</option>)}</Select></Field>
          </div>
          <p className="text-xs text-mu"><PriorityBadge p={t.p} short /> set by impact × urgency · {t.tier} Support · {t.cat}</p>
        </Body>
      </Section>
      <AiPanel t={t} />
      <Section>
        <Body>
          <p className="text-xs text-mu">Escalate to Tier 2 when:</p>
          {crit.map(([l, v]) => <p key={l}>{v ? <span className="text-wr">▲</span> : "○"} {l}</p>)}
          <div><Button size="sm" onClick={() => toggleElev(t.id)}>{t.elev ? "Clear" : "Flag"} elevated access</Button></div>
          {crit.some((c) => c[1]) && t.tier === "Tier 1" && <div><Chip c="#D97706">Escalation recommended</Chip></div>}
          <Button disabled={t.tier === "Tier 2" || res} onClick={() => escalate(t.id)}>Escalate to Tier 2</Button>
          {tier2 && t.cat === "Account & Password" ? <Button onClick={() => { triggerRpa(t.id); nav("/rpa"); }}>Trigger simulated password RPA</Button> : <Button disabled title="Only Tier 2 and authorized account/password tickets may enter credential-reset RPA"><Lock className="size-3" />RPA only for eligible account tickets</Button>}
          <Button variant="primary" disabled={res} onClick={() => resolve(t.id)}>{res ? "Resolved" : "Resolve & close"}</Button>
        </Body>
      </Section>
    </>
  );
}
