import { useEffect, useState } from "react";
import { Section, Body } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import { AiBadge, Chip, PriorityBadge } from "./Badges";
import { AI, IMP, MX, genericAi, isDone } from "@/lib/data";
import { useApp } from "@/store";

/** AI Agent-Assist (simulated LLM, per-ticket sample output). AI recommends, the agent decides (Accept / Edit / Ignore). */
export default function AiPanel({ t }) {
  const { acceptAi, ignoreAi, rerate, can, mine } = useApp(), a = AI[t.id] || genericAi(t), ok = can(4) && mine(t);
  const [edit, setEdit] = useState(false), [reply, setReply] = useState(a.rep);
  useEffect(() => { setReply(a.rep); setEdit(false); }, [t.id]); // eslint-disable-line
  const rec = t.rec !== undefined && t.imp !== t.rec;
  return (
    <Section title="AI Agent-Assist" action={<AiBadge>AI-generated</AiBadge>} className="border-l-2 border-l-ac bg-b2">
      <Body>
        <p>{a.sug}</p>
        <p className="text-xs text-mu">Confidence {a.conf}%{a.conf < 70 ? " (low: verify manually)" : ""} · Article: {a.art}</p>
        <p className="text-xs text-mu">Steps: {a.steps}.</p>
        <p className="text-xs text-mu">Similar resolved: {a.sim}</p>
        <div>
          <b>Recommended: </b>
          {rec ? (
            <>raise impact to {IMP[t.rec]} (3 similar tickets in Dorm B today) → <PriorityBadge p={MX[t.rec][t.urg]} short /> routes to Tier 2{" "}
              <Button size="sm" className="ml-1" disabled={!(can(3) && mine(t))} onClick={() => rerate(t.id, t.rec, t.urg)}>Apply</Button></>
          ) : <>keep <PriorityBadge p={t.p} short /> escalate only if the criteria below are met</>}
        </div>
        <p className="text-xs font-medium text-mu">Suggested reply</p>
        {edit ? <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} /> : <p className="rounded-lg border border-bd bg-sf px-3 py-2">{reply}</p>}
        {t.ai === "pending" && !isDone(t) ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" disabled={!ok} onClick={() => { acceptAi(t.id, reply); setEdit(false); }}>{edit ? "Send edited" : "Accept"}</Button>
            <Button size="sm" disabled={!ok} onClick={() => setEdit(!edit)}>Edit</Button>
            <Button size="sm" disabled={!ok} onClick={() => ignoreAi(t.id)}>Ignore (incorrect)</Button>
          </div>
        ) : <div><Chip c={t.ai === "accepted" ? "#16A34A" : "#DC2626"}>Agent {t.ai}</Chip></div>}
        <p className="text-xs text-mu">AI can be wrong: verify against the KB article before sending. Nothing is sent automatically; ignored suggestions are logged for AI quality review.</p>
      </Body>
    </Section>
  );
}
