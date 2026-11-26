import { Section } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Chip } from "@/components/Badges";
import { PF, RL } from "@/lib/data";
import { useApp } from "@/store";

export default function UsersRoles() {
  const { perm, users } = useApp();
  return (
    <>
      <div><h1>Users & Roles</h1><p className="text-mu">Review the fixed demo account roles and their access policy.</p></div>
      <Section title="Permissions">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Permission</th>{RL.map((r) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>{PF.map((f, i) => <tr key={f}><td>{f}</td>{RL.map((r, j) => <td key={r}><Switch checked={!!perm[i][j]} disabled aria-label={`${f}: ${r}`} /></td>)}</tr>)}</tbody></table></div>
        <p className="px-4 py-2 text-xs text-mu">Prototype: the permission matrix is read-only and reflects the demonstrated access policy. Production account management would require server-side authorization.</p>
      </Section>
      <Section title="Users">
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th></tr></thead>
          <tbody>{users.map(([n, e, r, st, la], i) => <tr key={n}><td>{n}</td><td className="text-mu">{e}</td>
            <td><span>{r}</span></td>
            <td><Chip c={st === "Active" ? "#16A34A" : "#DC2626"}>{st}</Chip></td><td className="text-mu">{la}</td></tr>)}</tbody></table></div>
      </Section>
    </>
  );
}
