import { Section } from "@/components/ui/card";
import { Chip } from "@/components/Badges";
import { Metrics } from "@/components/Metrics";
import { PF, RL } from "@/lib/data";
import { useApp } from "@/store";
import { Lock } from "lucide-react";

const LOGINS = [
  ["g••••••@student.edu", "Sign in", "Chrome · Windows", "10:31 AM", "Success"], ["m••••••@campus.edu", "Sign in", "Edge · Windows", "09:58 AM", "Success"],
  ["j•••••@student.edu", "Sign in", "Safari · iOS", "09:12 AM", "Failed (3 attempts)"], ["r•••••@campus.edu", "Role check", "Chrome · macOS", "08:47 AM", "Success"],
];

/** Data Privacy Act of 2012 (RA 10173), Sec. 11 general principles. */
const PRINCIPLES = [
  ["Transparency", "People know what data is collected, why, and who sees it.", "The ticket form states what is collected and why; AI content is labelled; every reveal and denial is visible in the audit log."],
  ["Legitimate purpose", "Data is used only for a declared, lawful purpose.", "Contact details and student ID are used only to resolve the ticket and verify identity for the password-reset bot. A Tier 2 reveal needs a typed reason."],
  ["Proportionality", "Only the data needed is collected, shown and kept.", "Fields are masked by default, Tier 1 sees the minimum, PII is masked before any AI use, and each role gets only the permissions it needs (RBAC)."],
];

export default function Security() {
  const { audit, perm } = useApp();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1>Security</h1><p className="text-mu">Privacy and access controls under RA 10173 (Data Privacy Act).</p></div>
        <div className="flex flex-wrap gap-2"><Chip c="#16A34A">PII Protected</Chip><Chip c="#2563EB">RBAC Enabled</Chip><Chip c="#2563EB">Access Logged</Chip></div>
      </div>
      <Section title="RA 10173 principles applied">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Principle</th><th>What it means</th><th>How CampusIT applies it</th></tr></thead>
          <tbody>{PRINCIPLES.map((r) => <tr key={r[0]}><td><b>{r[0]}</b></td><td className="text-mu">{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
      </Section>
      <Section title="PII masking (example of fields masked on every ticket)"><Metrics items={[["Email", "g••••••@student.edu"], ["Phone", "09•••••••21"], ["Student ID", "••••4821"]]} /></Section>
      <Section title="RBAC">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Feature</th>{RL.map((r) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>{PF.map((f, i) => <tr key={f}><td>{f}</td>{perm[i].map((v, j) => <td key={j}>{v ? <span className="text-ok">✓ Allowed</span> : <Lock className="size-3 text-mu" aria-label="Locked" />}</td>)}</tr>)}</tbody></table></div>
      </Section>
      <Section title="Audit logs and access events">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Action</th><th>Resource</th><th>Time</th><th>Result</th></tr></thead>
          <tbody>{audit.slice(0, 12).map((a, i) => <tr key={i}><td>{a[0]}</td><td>{a[1]}</td><td className="text-mu">{a[2]}</td><td>{a[3]}</td><td className={a[4] === "Denied" || a[4] === "Blocked" ? "text-er" : "text-ok"}>{a[4]}</td></tr>)}</tbody></table></div>
      </Section>
      <Section title="Login and activity history">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Event</th><th>Device</th><th>Time</th><th>Result</th></tr></thead>
          <tbody>{LOGINS.map((a, i) => <tr key={i}><td>{a[0]}</td><td>{a[1]}</td><td className="text-mu">{a[2]}</td><td>{a[3]}</td><td className={a[4] === "Success" ? "text-ok" : "text-er"}>{a[4]}</td></tr>)}</tbody></table></div>
      </Section>
    </>
  );
}
