import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { AiBadge, Chip, PriorityBadge, StatusBadge } from "@/components/Badges";
import { Sla, SlaBar, isRisk } from "@/components/Sla";
import { Metrics } from "@/components/Metrics";
import Lifecycle from "@/components/Lifecycle";
import AiPanel from "@/components/AiPanel";
import { IMP, M, RT, URG, piiOf, mask, isDone } from "@/lib/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

/** Three columns: Queue | Ticket | SLA + AI Agent-Assist. Selected ticket lives in the URL (/agent/:id). */
export default function AgentWorkspace() {
  const { tickets, gq, role, own } = useApp(), { id } = useParams();
  const open = tickets.filter((t) => !isDone(t) && (role === "a" || own(t))), rows = [...open].sort((a, b) => a.p - b.p || a.end - b.end);
  const sel = tickets.find((t) => t.id === id) || rows[0] || tickets[0];
  return (
    <>
      <Metrics items={[["Open Tickets", open.length], ["P1/P2 Tickets", open.filter((t) => t.p < 3).length], ["SLA At Risk", open.filter((t) => isRisk(t.end, t.tot)).length], ["SLA Breached", open.filter((t) => t.end < Date.now()).length], ["Resolved Today", 31 + tickets.length - open.length], ["Avg Resolution", "2h 36m"]]} />
      <div className="grid items-start gap-4 lg:grid-cols-[264px_1fr] xl:grid-cols-[288px_1fr_316px]">
        <Queue rows={rows} selId={sel.id} initial={gq} />
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
          <Sla end={t.end} total={t.tot} />
        </Link>
      ))}
      {!list.length && <p className="border-t border-bd px-3 py-3 text-mu">No tickets match.</p>}
    </Section>
  );
}

function TicketPanel({ t }) {
  const { genSummary, saveSummary, addNote, can, mine } = useApp();
  const [note, setNote] = useState(""), [edit, setEdit] = useState(false), [sv, setSv] = useState({});
  const s = t.sum;
  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bd px-4 py-3">
        <div><h2 className="text-base font-semibold">{t.issue}</h2><p className="text-xs text-mu">{t.id} · {t.who}</p></div>
        <div className="flex flex-wrap items-center gap-2"><PriorityBadge p={t.p} /><StatusBadge s={t.st} /><Button size="sm" disabled={!(can(8) && mine(t))} onClick={() => genSummary(t.id)}>ACW summary (1-click)</Button></div>
      </div>
      {s && (
        <div className="px-4 pt-3">
          <div className="flex flex-col gap-1 rounded-lg border border-bd bg-b2 p-3">
            <div><AiBadge>AI summary · review before saving</AiBadge></div>
            <p><b>Issue:</b> {s.issue}</p><p><b>Troubleshooting performed:</b> {s.tshoot}</p><p><b>Resolution:</b> {s.resolution}</p>
            <p><b>Sentiment:</b> {s.sentiment}</p><p><b>Follow-up:</b> {s.follow}</p><p><b>Suggested note:</b> {s.note}</p>
            <div className="mt-1 flex gap-2">
              <Button size="sm" onClick={() => { setSv({ issue: s.issue, tshoot: s.tshoot, resolution: s.resolution, follow: s.follow, note: s.note }); setEdit(true); }}>Edit</Button>
              <Button size="sm" variant="primary" onClick={() => saveSummary(t.id, {})}>{s.saved ? "Saved" : "Save"}</Button>
            </div>
          </div>
          <Dialog open={edit} onOpenChange={setEdit}>
            <DialogContent title="Edit summary">
              <div className="flex flex-col gap-2">{[["issue", "Issue"], ["tshoot", "Troubleshooting performed"], ["resolution", "Resolution"], ["follow", "Follow-up"], ["note", "Suggested note"]].map(([k, l]) => <Field key={k} label={l}><Textarea rows={2} value={sv[k] || ""} onChange={(e) => setSv({ ...sv, [k]: e.target.value })} /></Field>)}</div>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" onClick={() => { saveSummary(t.id, sv); setEdit(false); }}>Save</Button>
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
            <PiiField t={t} />
          </div>
          <p>{t.desc}</p>{t.dev && <p className="text-xs text-mu">Device: {t.dev}</p>}{t.att && <p className="text-xs text-mu">Attachment: {t.att}</p>}
        </Body></TabsContent>
        <TabsContent value="c"><Body>{t.msgs.map((m, i) => <p key={i}><b>{m[0]}</b> <span className="text-xs text-mu">{m[1]}</span><br />{m[2]}</p>)}{!t.msgs.length && <p className="text-mu">No messages yet.</p>}</Body></TabsContent>
        <TabsContent value="n"><Body>
          {t.notes.map((n, i) => <p key={i} className="rounded-lg border border-bd bg-b2 p-2">{n}</p>)}{!t.notes.length && <p className="text-mu">No notes.</p>}
          <div className="flex gap-2"><Input aria-label="Internal note" placeholder="Add internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
            <Button disabled={!mine(t)} onClick={() => { if (note.trim()) { addNote(t.id, note.trim()); setNote(""); } }}>Add</Button></div>
        </Body></TabsContent>
        <TabsContent value="a"><Body className="gap-0">{t.act.map((a, i) => <p key={i} className="border-l border-bd2 pb-3 pl-4"><span className="text-xs text-mu">{a[0]}</span> {a[1]}</p>)}</Body></TabsContent>
      </Tabs>
    </Section>
  );
}

/** Escalation rule: Tier 1 → Tier 2 when impact is broad, half the resolution time is gone, or elevated access is needed. */
function SidePanel({ t }) {
  const { rerate, escalate, toggleElev, resolve, triggerRpa, confirmTriage, claim, own, mine, me, can } = useApp(), nav = useNavigate();
  const res = isDone(t), canWork = can(8) && mine(t), canRpa = can(5) && mine(t);
  const crit = [["Impact is department, building or campus", t.imp < 2], ["Half the resolution time used", (Date.now() - t.t0) / (t.end - t.t0) >= 0.5], ["Needs elevated access", t.elev], ["SLA breached", Date.now() > t.end]];
  return (
    <>
      <Section title="SLA">
        <Body className="gap-2">
          <div className="flex items-center justify-between"><span className="text-mu">Response</span>{t.resp ? <b className="text-ok">Responded</b> : <Sla end={t.rend} total={RT[t.p]} long />}</div>
          {!t.resp && <SlaBar end={t.rend} total={RT[t.p]} />}
          <div className="flex items-center justify-between"><span className="text-mu">Resolution</span><Sla end={t.end} total={t.tot} long /></div>
          <SlaBar end={t.end} total={t.tot} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Impact"><Select disabled={!(can(3) && mine(t))} value={t.imp} onChange={(e) => rerate(t.id, +e.target.value, t.urg)}>{IMP.map((n, i) => <option key={n} value={i}>{n}</option>)}</Select></Field>
            <Field label="Urgency"><Select disabled={!(can(3) && mine(t))} value={t.urg} onChange={(e) => rerate(t.id, t.imp, +e.target.value)}>{URG.map((n, i) => <option key={n} value={i}>{n}</option>)}</Select></Field>
          </div>
          <p className="text-xs text-mu"><PriorityBadge p={t.p} short /> set by impact × urgency · {t.tier} Support · {t.cat}</p>
          {!t.triaged && <div className="flex flex-wrap items-center gap-2"><Chip c="#D97706">Requester-suggested priority</Chip><Button size="sm" disabled={!(can(3) && mine(t))} onClick={() => confirmTriage(t.id)}>Confirm P{t.p}</Button></div>}
        </Body>
      </Section>
      <AiPanel t={t} />
      <Section>
        <Body>
          {own(t) && !res && t.as !== me && <Button size="sm" variant="primary" onClick={() => claim(t.id)}>Claim ticket</Button>}
          {!mine(t) && !res && <p className="text-xs text-mu"><Lock className="mr-1 inline size-3" />{own(t) ? "Claim this ticket to act on it." : `Read-only: this ticket is owned by ${t.tier}.`}</p>}
          <p className="text-xs text-mu">Escalate to Tier 2 when:</p>
          {crit.map(([l, v]) => <p key={l}>{v ? <span className="text-wr">▲</span> : "○"} {l}</p>)}
          <div><Button size="sm" onClick={() => toggleElev(t.id)}>{t.elev ? "Clear" : "Flag"} elevated access</Button></div>
          {crit.some((c) => c[1]) && t.tier === "Tier 1" && <div><Chip c="#D97706">Escalation recommended</Chip></div>}
          <Button disabled={!canWork || t.tier === "Tier 2" || res} onClick={() => escalate(t.id)}>Escalate to Tier 2</Button>
          {canRpa ? <Button disabled={t.cat !== "Account & Password" || res} onClick={() => { triggerRpa(t.id); nav("/rpa"); }}>{t.cat === "Account & Password" ? "Trigger password-reset bot" : "RPA not eligible (password resets only)"}</Button> : <Button disabled><Lock className="size-3" />RPA not permitted for your role</Button>}
          <Button variant="primary" disabled={res || !canWork || !t.sum?.saved} onClick={() => resolve(t.id)}>{res ? "Resolved" : t.sum?.saved ? "Resolve & close" : "Save ACW summary to close"}</Button>
        </Body>
      </Section>
    </>
  );
}

/** RA 10173: PII is masked by default. Only Tier 2 can reveal it, with a typed reason that is written to the audit log. */
function PiiField({ t }) {
  const { can, rev, reveal } = useApp(), [why, setWhy] = useState(""), p = piiOf(t), shown = rev[t.id];
  return (
    <div>
      <div className="text-xs text-mu">Contact (RA 10173)</div>
      {shown ? <>{p.email} · {p.phone} · {p.sid} <Chip c="#D97706">Revealed · logged</Chip></> : <>{mask.email(p.email)} · {mask.phone(p.phone)} · {mask.sid(p.sid)} <Chip c="#16A34A">PII masked</Chip></>}
      {!shown && (can(9)
        ? <div className="mt-1 flex gap-1"><Input aria-label="Reason to reveal" placeholder="Reason to reveal (required)" value={why} onChange={(e) => setWhy(e.target.value)} /><Button size="sm" onClick={() => why.trim() && reveal(t.id, why.trim())}>Reveal</Button></div>
        : <p className="text-xs text-mu"><Lock className="mr-1 inline size-3" />Reveal requires Tier 2</p>)}
    </div>
  );
}
