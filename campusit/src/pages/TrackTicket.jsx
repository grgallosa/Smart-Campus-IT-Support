import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "@/components/Badges";
import { Sla } from "@/components/Sla";
import { ownsTicket, useApp } from "@/store";
import { cn } from "@/lib/utils";

const STEPS = ["Submitted", "Assigned", "In Progress", "Resolved"];

/** Student-facing tracking: status timeline, team, SLA, conversation and reply. */
export default function TrackTicket() {
  const { id } = useParams(), { tickets, studentReply, role, deny } = useApp(), [text, setText] = useState("");
  const t = tickets.find((x) => x.id === id && ownsTicket(role, x));
  useEffect(() => { if (!t) deny("Ticket " + id); }, [id, role, !!t]);
  if (!t) return <p className="text-mu">Ticket unavailable or access restricted. <Link className="text-acx" to="/tickets">Back to my tickets</Link></p>;
  const last = t.msgs.length ? t.msgs[t.msgs.length - 1][2] : "We’ve received your ticket.";
  return (
    <>
      <Section title={`${t.id} · ${t.issue}`} action={<PriorityBadge p={t.p} />}>
        <Body className="gap-4">
          <div className="flex gap-1 overflow-x-auto">
            {STEPS.map((s, i) => <div key={s} className={cn("min-w-20 flex-1 border-t-2 pt-1.5 font-medium", i <= t.step ? "border-ac text-tx" : "border-bd text-mu")}>{s}</div>)}
          </div>
          {t.assetId && <div className="rounded-lg border border-bd bg-b2 p-3"><b>QR equipment report</b><p className="text-mu">Asset: {t.assetId} · Type: {t.assetType || "Equipment"} · Location: {t.loc}</p><p className="text-xs text-mu">This ticket and its status also appear in the authorized IT agent queue.</p></div>}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div><div className="text-xs text-mu">Status</div><b>{t.st}</b></div>
            <div><div className="text-xs text-mu">Team</div><b>{t.tier} Support</b></div>
            <div><div className="text-xs text-mu">SLA</div>{t.st === "Resolved" ? <b className="text-ok">Met</b> : <Sla end={t.end} />}</div>
            <div className="min-w-0"><div className="text-xs text-mu">Latest update</div><b>{last}</b></div>
          </div>
        </Body>
      </Section>
      <Section title="Conversation">
        <Body>
          <p className="text-mu">{t.desc}</p>
          {t.msgs.map((m, i) => <p key={i}><b>{m[0]}</b> <span className="text-xs text-mu">{m[1]}</span><br />{m[2]}</p>)}
          <p className="text-xs text-mu">Attachment: wifi-error.png</p>
          <div className="flex gap-2">
            <Input aria-label="Reply" placeholder="Reply to support..." value={text} onChange={(e) => setText(e.target.value)} />
            <Button variant="primary" onClick={() => { if (text.trim()) { studentReply(t.id, text.trim()); setText(""); } }}>Send</Button>
          </div>
        </Body>
      </Section>
    </>
  );
}
