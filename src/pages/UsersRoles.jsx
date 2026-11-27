import { Section } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Chip } from "@/components/Badges";
import { PF, RL, ROLES } from "@/lib/data";
import { useApp } from "@/store";

export default function UsersRoles() {
  const { perm, togglePerm, users, setUserRole } = useApp();
  return (
    <>
      <div><h1>Users & Roles</h1><p className="text-mu">Manage who can do what. Every change is written to the audit log.</p></div>
      <Section title="Permissions">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Permission</th>{RL.map((r) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>{PF.map((f, i) => <tr key={f}><td>{f}</td>{RL.map((r, j) => <td key={r}><Switch checked={!!perm[i][j]} disabled={j === 3 && (i === 6 || i === 7)} onCheckedChange={() => togglePerm(i, j)} aria-label={`${f}: ${r}`} /></td>)}</tr>)}</tbody></table></div>
        <p className="px-4 py-2 text-xs text-mu">Changes apply immediately to the demo roles. Every change is audit-logged.</p>
      </Section>
      <Section title="Users">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th></tr></thead>
          <tbody>{users.map(([n, e, r, st, la], i) => <tr key={n}><td>{n}</td><td className="text-mu">{e}</td>
            <td><Select aria-label={`Role for ${n}`} className="w-auto" value={r} onChange={(ev) => setUserRole(i, ev.target.value)}>{ROLES.map((x) => <option key={x}>{x}</option>)}</Select></td>
            <td><Chip c={st === "Active" ? "#16A34A" : "#DC2626"}>{st}</Chip></td><td className="text-mu">{la}</td></tr>)}</tbody></table></div>
      </Section>
    </>
  );
}
