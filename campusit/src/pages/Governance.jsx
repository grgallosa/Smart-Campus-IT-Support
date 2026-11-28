import { Section, Body } from "@/components/ui/card";
import { Chip } from "@/components/Badges";

const RAID = [
  ["Risk", "AI suggests a wrong fix or priority", "Medium / High", "AI Specialist", "Agent must Accept, Edit or Ignore; confidence and KB source shown; ignored suggestions logged", "Mitigated"],
  ["Risk", "Bot resets the wrong account", "Low / High", "RPA Lead", "ID + phone check, agent approval, bot stops on mismatch", "Mitigated"],
  ["Risk", "PII exposed to Tier 1 or in AI prompts", "Medium / High", "Compliance Auditor", "Fields masked by default; Tier 2 reveal needs a reason and is audited; mask before AI use", "Mitigated"],
  ["Risk", "Requester overstates impact to jump the queue", "Medium / Medium", "Project Manager", "Agent verifies and can re-rate; re-rate is logged and SLA recalculated", "Open"],
  ["Risk", "P1/P2 SLA breach", "Low / High", "Project Manager", "24×7 clocks, amber “At risk” alert when under 25% of the target time is left, breach flagged as an escalation criterion", "Mitigated"],
  ["Assumption", "Campus directory exposes a scoped password-reset API", "n/a", "RPA Lead", "Validate with campus IT before go-live", "Open"],
  ["Assumption", "Students have a registered phone number on file", "n/a", "Compliance Auditor", "Fallback: bot stops and agent verifies manually", "Open"],
  ["Assumption", "KB articles are kept current by IT staff", "n/a", "Project Manager", "Review owner and date on each article", "Open"],
  ["Issue", "Prototype AI output is pre-written (no live LLM)", "n/a", "AI Specialist", "Disclosed here and in the pitch; production would call an LLM", "Known"],
  ["Issue", "No backend: data resets on refresh", "n/a", "UI/UX Lead", "Out of scope per handout", "Accepted"],
  ["Dependency", "Campus SSO and ticketing integration", "n/a", "Project Manager", "Needed for real user data", "Planned"],
  ["Dependency", "LLM provider with a data-processing agreement (RA 10173)", "n/a", "Compliance Auditor", "Select provider before production", "Planned"],
];
const T = ({ head, rows }) => <div className="overflow-x-auto"><table className="tbl"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j > 1 ? "text-mu" : ""}>{c}</td>)}</tr>)}</tbody></table></div>;

export default function Governance() {
  return (
    <>
      <div><h1>RAID log &amp; AI disclosure</h1><p className="text-mu">Risks, assumptions, issues and dependencies, plus how AI is used and controlled.</p></div>
      <Section title="RAID log"><T head={["Type", "Item", "Likelihood / Impact", "Owner", "Mitigation / Action", "Status"]} rows={RAID} /></Section>
      <Section title="AI use in this product">
        <Body className="gap-1">
          <p>Tier 0 chat: keyword rules mapped to Knowledge Base articles (simulated). Agent-Assist and ACW summary: pre-written sample outputs per ticket (simulated LLM).</p>
          <p>Safeguards: AI content is always labelled; agents Accept, Edit or Ignore; nothing is sent or saved without a human click; the ACW summary must be reviewed and saved before a ticket can close; every AI decision is audit-logged.</p>
        </Body>
      </Section>
      <Section title="AI tools used by the team (handout disclosure)">
        <T head={["Tool", "Used for", "Reviewed by"]} rows={[["TEAM TO COMPLETE", "e.g. drafting mock tickets, reviewing code", "Member name"], ["TEAM TO COMPLETE", "e.g. UI brainstorming", "Member name"]]} />
        <p className="px-4 py-2"><Chip c="#D97706">Replace the placeholders above with the tools your team actually used</Chip></p>
      </Section>
    </>
  );
}
