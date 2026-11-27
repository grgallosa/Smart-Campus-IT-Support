import { useState } from "react";
import { Button } from "./ui/button";
import { Field, Input, Select, Textarea } from "./ui/input";
import { PriorityBadge } from "./Badges";
import { CATS, HOW, IMP, MX, URG, WHO } from "@/lib/data";

/** Ticket form shown inside the Tier 0 chat. Priority = Impact × Urgency, with the routing tier previewed. */
export default function TicketForm({ draft, tried, onSubmit }) {
  const [f, setF] = useState({ cat: CATS[0], loc: "", imp: "2", urg: "0", subject: draft, desc: tried ? "Already tried the AI troubleshooting steps without success." : "", dev: "", att: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const p = MX[+f.imp][+f.urg];
  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="text-xs text-mu">I couldn’t resolve this one. Review the details and send them to IT support.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Issue type"><Select value={f.cat} onChange={set("cat")}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Location"><Input value={f.loc} onChange={set("loc")} placeholder="Dorm B, Room 212" /></Field>
        <Field label="Who is affected?"><Select value={f.imp} onChange={set("imp")}>{WHO.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
        <Field label="How urgent is it?"><Select value={f.urg} onChange={set("urg")}>{HOW.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
      </div>
      <Field label="Subject"><Input value={f.subject} onChange={set("subject")} /></Field>
      <Field label="Description"><Textarea rows={2} value={f.desc} onChange={set("desc")} /></Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Device"><Input value={f.dev} onChange={set("dev")} placeholder="Windows laptop" /></Field>
        <Field label="Attachment"><Input type="file" className="px-2 py-1" onChange={(e) => setF({ ...f, att: e.target.files?.[0]?.name || "" })} /></Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge p={p} />
          <span className="text-xs text-mu">{IMP[+f.imp]} impact × {URG[+f.urg]} urgency · Tier 1 verifies this priority first</span>
        </div>
        <Button variant="primary" onClick={() => onSubmit({ ...f, imp: +f.imp, urg: +f.urg })}>Submit ticket</Button>
      </div>
    </div>
  );
}
