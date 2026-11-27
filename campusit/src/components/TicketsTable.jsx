import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./Badges";
import { isDone } from "@/lib/data";
import { Sla } from "./Sla";

/** Compact ticket table used on the Help Center and My Tickets. */
export default function TicketsTable({ rows, base = "/tickets" }) {
  if (!rows.length) return <p className="px-4 py-3 text-mu">No tickets yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Ticket</th><th>Issue</th><th>Priority</th><th>Status</th><th>SLA</th></tr></thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td><Link className="font-medium text-acx hover:underline" to={`${base}/${t.id}`}>{t.id}</Link></td>
              <td>{t.issue}</td><td><PriorityBadge p={t.p} short /></td><td><StatusBadge s={t.st} /></td>
              <td>{isDone(t) ? "—" : <Sla end={t.end} total={t.tot} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
