import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Section, Body } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AiBadge, PriorityBadge, StatusBadge } from "./Badges";
import { Sla } from "./Sla";
import TicketForm from "./TicketForm";
import { SOL } from "@/lib/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

const SUGGEST = ["I can’t connect to campus Wi-Fi.", "Reset my password", "Printer is offline"];

/** Tier 0: give the fix straight away → "Yes, resolved" or "Still not working" → ticket form in the chat. */
export default function ChatAssistant({ seed }) {
  const { createTicket } = useApp();
  const [chat, setChat] = useState([]), [out, setOut] = useState(""), [draft, setDraft] = useState(""), [done, setDone] = useState(null), [text, setText] = useState("");

  const ask = (t) => {
    const m = SOL.find((x) => x.re.test(t));
    setDone(null); setDraft(t.length < 60 ? t : "");
    setChat((c) => [...c, { r: "u", t }, m ? { r: "a", steps: m.steps, fix: true } : { r: "a", t: "I couldn’t find a confident answer for that." }]);
    setOut(m ? "" : "esc");
  };
  useEffect(() => { if (seed?.text) ask(seed.text); }, [seed]); // eslint-disable-line
  const pick = (label, o) => { setChat((c) => [...c, { r: "u", t: label }]); setOut(o); };
  const send = () => { if (text.trim()) { ask(text.trim()); setText(""); } };

  return (
    <Section title="CampusCare AI" action={<AiBadge />} className="border-l-2 border-l-ac">
      <Body className="gap-3">
        <div className="max-w-xl self-start rounded-xl bg-b2 px-3 py-2">Hi! Describe your problem and I’ll help you find a solution.</div>
        {chat.map((m, i) => (
          <div key={i} className={cn("max-w-xl rounded-xl px-3 py-2", m.r === "u" ? "self-end bg-ac text-btt" : "self-start bg-b2")}>
            {m.t}
            {m.steps && <><p>Here’s a quick fix:</p><ol className="ml-4 list-decimal">{m.steps.map((s) => <li key={s}>{s}</li>)}</ol><p className="mt-2">Did that fix it?</p></>}
            {m.fix && i === chat.length - 1 && !out && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="primary" onClick={() => pick("Yes, resolved", "ok")}>Yes, resolved</Button>
                <Button size="sm" onClick={() => pick("Still not working", "esc")}>Still not working</Button>
              </div>
            )}
          </div>
        ))}
        {out === "ok" && <div className="rounded-lg border border-ok bg-b2 p-3"><b className="text-ok">AI Self-Service → Resolved</b><p className="text-xs text-mu">Glad that worked. No ticket needed.</p></div>}
        {done ? (
          <div className="rounded-lg border border-ok bg-b2 p-3">
            <b className="text-ok">Ticket #{done.id} created successfully.</b>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              <div><div className="text-xs text-mu">Priority</div><PriorityBadge p={done.p} /></div>
              <div><div className="text-xs text-mu">Status</div><StatusBadge s={done.st} /></div>
              <div><div className="text-xs text-mu">SLA target</div><Sla end={done.end} /></div>
              <div><div className="text-xs text-mu">Assigned</div><b>{done.tier} Support</b></div>
              <div><div className="text-xs text-mu">Est. response</div><b>{["", "15 min", "30 min", "2 hours", "8 hours"][done.p]}</b></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/tickets/${done.id}`} className="inline-flex h-7 items-center rounded-md bg-ac px-2 text-xs font-medium text-btt hover:bg-ach">Track ticket</Link>
              <Button size="sm" onClick={() => { setDone(null); setOut("esc"); }}>New ticket</Button>
            </div>
          </div>
        ) : out === "esc" && (
          <div className="rounded-lg border border-wr bg-b2 p-3">
            <b className="text-wr">AI Self-Service → Escalate to IT Support</b>
            <TicketForm key={draft} draft={draft} tried={chat.length > 0} onSubmit={(f) => setDone(createTicket(f))} />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-mu">Try</span>
          {SUGGEST.map((q) => <Button key={q} size="sm" onClick={() => ask(q)}>{q}</Button>)}
          <Button size="sm" onClick={() => { setDraft(""); setDone(null); setOut("esc"); }}>Create a ticket</Button>
        </div>
        <div className="flex gap-2">
          <Input aria-label="Ask CampusCare AI" placeholder="Ask anything about campus IT..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button variant="primary" onClick={send}>Send</Button>
        </div>
      </Body>
    </Section>
  );
}
