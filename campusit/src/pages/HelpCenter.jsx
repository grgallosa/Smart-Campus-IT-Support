import { useEffect, useState } from "react";
import { ChevronDown, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import ChatAssistant from "@/components/ChatAssistant";
import TicketsTable from "@/components/TicketsTable";
import { Section } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHIPS, TOPICS } from "@/lib/data";
import { ownsTicket, useApp } from "@/store";
import { cn } from "@/lib/utils";

/** Tier 0 Help Center: search → AI chat (ticket form inside) → my tickets → popular topics. */
export default function HelpCenter() {
  const { gq, tickets, role } = useApp();
  const [q, setQ] = useState(gq), [cat, setCat] = useState(""), [seed, setSeed] = useState(null);
  useEffect(() => setQ(gq), [gq]);
  const list = TOPICS.filter((t) => (!cat || t.chip === cat) && (!q || (t.title + t.body + t.chip).toLowerCase().includes(q.toLowerCase())));
  const mine = tickets.filter((t) => ownsTicket(role, t)).slice(0, 4);
  return (
    <>
      <div className="py-6 text-center">
        <h1 className="text-[28px]">How can we help?</h1>
        <Input aria-label="Search guides" className="mx-auto mt-4 h-11 max-w-xl text-[15px]" placeholder="Search IT solutions and guides..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {CHIPS.map((c) => (
            <Button key={c} size="sm" aria-pressed={cat === c} className={cn(cat === c && "border-ac bg-acs text-acx")} onClick={() => setCat(cat === c ? "" : c)}>{c}</Button>
          ))}
        </div>
      </div>
      <Section title="Report laboratory equipment problem" action={<span className="text-xs text-mu">QR-linked asset reporting</span>}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div><p className="font-semibold">Scan a QR label on a classroom PC, projector, or printer.</p><p className="text-xs text-mu">Asset and room details fill automatically; unresolved problems become IT tickets.</p></div>
          <Link to="/report" className="inline-flex items-center gap-2 rounded-md bg-ac px-4 py-2 font-medium text-btt hover:bg-ach"><QrCode className="size-4" /> Scan QR / Report Issue</Link>
        </div>
      </Section>
      <ChatAssistant seed={seed} />
      <Section title="My tickets" action={<Link to="/tickets" className="text-acx hover:underline">View all</Link>}>
        <TicketsTable rows={mine} />
      </Section>
      <Section title="Popular topics" action={<span className="text-xs text-mu">Select a topic to read</span>}>
        {list.map((t) => (
          <details key={t.title} className="group border-b border-bd last:border-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 hover:bg-b2 group-open:font-semibold [&::-webkit-details-marker]:hidden">
              {t.title}<ChevronDown className="size-4 shrink-0 text-mu transition-transform group-open:rotate-180" />
            </summary>
            <p className="max-w-[72ch] px-4 pb-3 text-mu">{t.body}</p>
          </details>
        ))}
        {!list.length && <p className="px-4 py-3 text-mu">No matching guides. <Button variant="link" onClick={() => setSeed({ text: q || "help", n: Date.now() })}>Ask CampusIT AI</Button></p>}
      </Section>
    </>
  );
}
