import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "@/components/Badges";
import { isDone } from "@/lib/data";
import { Sla } from "@/components/Sla";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

const STEPS = ["Submitted", "Assigned", "In Progress", "Resolved", "Closed"];

/** Student-facing tracking: status timeline, team, SLA, conversation and reply. */
export default function TrackTicket() {
  const { id } = useParams(), { tickets, studentReply, closeTicket, reopen } = useApp(), [text, setText] = useState("");
  const t = tickets.find((x) => x.id === id);
  if (!t) return <p className="text-mu">Ticket not found. <Link className="text-acx" to="/tickets">Back to my tickets</Link></p>;
  const last = t.msgs.length ? t.msgs[t.msgs.length - 1][2] : "We’ve received your ticket.";
  return (
    <>
      <Section title={`${t.id} · ${t.issue}`} action={<PriorityBadge p={t.p} />}>
        <Body className="gap-4">
          {t.st === "Resolved" && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ok bg-b2 p-3"><span>Support marked this resolved. Is it fixed?</span><Button variant="primary" size="sm" onClick={() => closeTicket(t.id)}>Yes, close ticket</Button><Button size="sm" onClick={() => reopen(t.id)}>No, reopen</Button></div>}
          <div className="flex gap-1 overflow-x-auto">
            {STEPS.map((s, i) => <div key={s} className={cn("min-w-20 flex-1 border-t-2 pt-1.5 font-medium", i <= t.step ? "border-ac text-tx" : "border-bd text-mu")}>{s}</div>)}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div><div className="text-xs text-mu">Status</div><b>{t.st}</b></div>
            <div><div className="text-xs text-mu">Team</div><b>{t.tier} Support</b></div>
            <div><div className="text-xs text-mu">SLA</div>{isDone(t) ? (t.done && t.done > t.end ? <b className="text-er">Missed</b> : <b className="text-ok">Met</b>) : <Sla end={t.end} total={t.tot} />}</div>
            <div className="min-w-0"><div className="text-xs text-mu">Latest update</div><b>{last}</b></div>
          </div>
        </Body>
      </Section>
      <Section title="Conversation">
        <Body>
          <p className="text-mu">{t.desc}</p>{t.dev && <p className="text-xs text-mu">Device: {t.dev}</p>}{t.att && <p className="text-xs text-mu">Attachment: {t.att}</p>}
          {t.msgs.map((m, i) => <p key={i}><b>{m[0]}</b> <span className="text-xs text-mu">{m[1]}</span><br />{m[2]}</p>)}
          
          <div className="flex gap-2">
            <Input aria-label="Reply" placeholder="Reply to support..." value={text} onChange={(e) => setText(e.target.value)} />
            <Button variant="primary" onClick={() => { if (text.trim()) { studentReply(t.id, text.trim()); setText(""); } }}>Send</Button>
          </div>
        </Body>
      </Section>
    </>
  );
}
