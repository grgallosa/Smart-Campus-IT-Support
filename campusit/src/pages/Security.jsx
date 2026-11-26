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

export default function Security() {
  const { audit, perm } = useApp();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1>Security</h1><p className="text-mu">Demonstration of privacy safeguards and role-based access under RA 10173. This client-only prototype is not production authentication.</p></div>
        <div className="flex flex-wrap gap-2"><Chip c="#16A34A">PII Protected</Chip><Chip c="#2563EB">RBAC Enabled</Chip><Chip c="#2563EB">Access Logged</Chip></div>
      </div>
      <Section title="PII protection"><Metrics items={[["Email", "g••••••@student.edu"], ["Phone", "09•••••••21"], ["Student ID", "••••4821"]]} /></Section>
      <Section title="RBAC">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Feature</th>{RL.map((r) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>{PF.map((f, i) => <tr key={f}><td>{f}</td>{perm[i].map((v, j) => <td key={j}>{v ? <span className="text-ok">✓ Allowed</span> : <Lock className="size-3 text-mu" aria-label="Locked" />}</td>)}</tr>)}</tbody></table></div>
      </Section>
      <Section title="Audit logs and access events">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Action</th><th>Resource</th><th>Time</th><th>Result</th></tr></thead>
          <tbody>{audit.slice(0, 12).map((a, i) => <tr key={i}><td>{a[0]}</td><td>{a[1]}</td><td className="text-mu">{a[2]}</td><td>{a[3]}</td><td className={a[4] === "Denied" ? "text-er" : "text-ok"}>{a[4]}</td></tr>)}</tbody></table></div>
      </Section>
      <Section title="Sample historical login records">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Event</th><th>Device</th><th>Time</th><th>Result</th></tr></thead>
          <tbody>{LOGINS.map((a, i) => <tr key={i}><td>{a[0]}</td><td>{a[1]}</td><td className="text-mu">{a[2]}</td><td>{a[3]}</td><td className={a[4] === "Success" ? "text-ok" : "text-er"}>{a[4]}</td></tr>)}</tbody></table></div>
      </Section>
    </>
  );
}
