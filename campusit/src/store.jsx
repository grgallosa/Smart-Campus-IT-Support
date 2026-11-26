import { createContext, useContext, useRef, useState } from "react";
import { MX, TOT, RT, clock, makeTicket, seedTickets, seedAudit, PERM0, USERS, RPA_LOG0 } from "@/lib/data";

export const U = { s: ["Gina Reyes", "Student"], t: ["Marco Santos", "Tier 1 Agent"], u: ["Rafael Cruz", "Tier 2 Agent"], a: ["Ana Lopez", "IT Administrator"] };
const Ctx = createContext();
export const useApp = () => useContext(Ctx);

/** Single in-memory store (no backend). Every mutation also writes to the audit log. */
export function AppProvider({ children, initialRole = "s" }) {
  const [role, setRole] = useState(initialRole);
  const [tickets, setTickets] = useState(seedTickets);
  const [notes, setNotes] = useState(["Welcome to CampusIT"]);
  const [audit, setAudit] = useState(seedAudit);
  const [perm, setPerm] = useState(PERM0);
  const [users, setUsers] = useState(USERS);
  const [rpa, setRpa] = useState({ pct: 72, state: "Running", log: RPA_LOG0 });
  const [rpaId, setRpaId] = useState("CIT-2026-1042");
  const [msg, setMsg] = useState("");
  const [gq, setGq] = useState("");
  const seq = useRef(0), tm = useRef();

  const toast = (m) => { setMsg(m); clearTimeout(tm.current); tm.current = setTimeout(() => setMsg(""), 2400); };
  const log = (u, a, r, res = "Authorized") => setAudit((x) => [[u, a, r || "—", clock(), res], ...x]);
  const notify = (m) => setNotes((n) => [m, ...n]);
  const get = (id) => tickets.find((t) => t.id === id);
  const upd = (id, fn) => setTickets((ts) => ts.map((t) => (t.id === id ? fn({ ...t, act: [...t.act], msgs: [...t.msgs], notes: [...t.notes] }) : t)));
  const A = (t, x) => { t.act.push([clock(), x]); return t; };

  const createTicket = (f) => {
    const p = MX[f.imp][f.urg], hi = p < 3;
    const t = makeTicket({
      id: 1043 + seq.current++, who: "G. Reyes", issue: f.subject || "IT support request", imp: f.imp, urg: f.urg,
      st: "Assigned", ago: 0, as: hi ? "Tier 2 queue" : "Tier 1 queue", tier: hi ? "Tier 2" : "Tier 1", cat: f.cat, step: 1,
      desc: f.desc || f.subject, loc: f.loc,
      act: [[clock(), "Ticket created"], [clock(), `Triaged as P${p} (impact × urgency)`], [clock(), "Auto-routed to " + (hi ? "Tier 2" : "Tier 1")]],
    });
    setTickets((ts) => [t, ...ts]); notify("Ticket #" + t.id + " created"); log("Student", "Submitted ticket", t.id); toast("Ticket " + t.id + " created");
    return t;
  };

  /** Priority comes from Impact × Urgency. Re-rating restarts SLA from creation; P1/P2 auto-route to Tier 2. */
  const rerate = (id, imp, urg) => {
    const t = get(id), np = MX[imp][urg], o = t.p, route = np !== o && np < 3 && t.tier === "Tier 1";
    upd(id, (x) => {
      x.imp = imp; x.urg = urg;
      if (np !== o) {
        x.p = np; x.tot = TOT[np]; x.end = x.t0 + TOT[np]; x.rend = x.t0 + RT[np];
        A(x, `Re-rated P${o} → P${np} (impact × urgency); SLA recalculated from creation`);
        if (route) { x.tier = "Tier 2"; x.as = "Tier 2 queue"; x.st = "Assigned"; A(x, "Auto-routed to Tier 2 (P1/P2 rule)"); }
      }
      return x;
    });
    if (np === o) return toast("Priority unchanged");
    log("Agent", "Re-rated priority", id);
    if (route) { notify(`#${id} re-rated P${np} and routed to Tier 2`); toast(`Re-rated P${np} · routed to Tier 2`); } else toast("Re-rated to P" + np);
  };

  const studentReply = (id, text) => { upd(id, (t) => { t.msgs.push([U.s[0], clock(), text]); return t; }); toast("Reply sent"); };
  const acceptAi = (id, text) => {
    upd(id, (t) => {
      t.ai = "accepted"; t.resp = true; t.rep = text;
      if (["New", "Open", "Submitted", "Assigned"].includes(t.st)) t.st = "In Progress";
      t.step = Math.max(t.step, 2); t.msgs.push([U[role][0], clock(), text]);
      return A(t, "Agent approved AI suggestion and replied");
    });
    notify("Update on #" + id + ": agent replied"); log("Agent", "Approved AI suggestion", id); toast("Reply sent to requester");
  };
  const ignoreAi = (id) => { upd(id, (t) => { t.ai = "ignored"; return A(t, "Agent ignored AI suggestion"); }); log("Agent", "Ignored AI suggestion", id); toast("Suggestion ignored"); };
  const addNote = (id, x) => { upd(id, (t) => { t.notes.push(x); return A(t, "Internal note added"); }); log("Agent", "Added internal note", id); };
  const escalate = (id) => {
    upd(id, (t) => { t.tier = "Tier 2"; t.as = "R. Cruz"; t.st = "Escalated"; return A(t, "Escalated to Tier 2 (priority unchanged)"); });
    notify(`#${id} escalated to Tier 2`); log("Agent", "Escalated to Tier 2", id); toast("Escalated to Tier 2");
  };
  const toggleElev = (id) => upd(id, (t) => { t.elev = !t.elev; return t; });
  const genSummary = (id) => upd(id, (t) => {
    t.sum = { issue: "Requester reported: " + t.issue + ".", tshoot: "Verified account and guided the user through reconnecting.", resolution: "Connection restored.", sentiment: "Neutral, positive after the fix", follow: "Monitor access point.", note: "Dorm B Wi-Fi auth issue, fixed by reconnecting. Watch for repeat reports.", saved: false };
    return t;
  });
  const saveSummary = (id, patch) => { upd(id, (t) => { t.sum = { ...t.sum, ...patch, saved: true }; return A(t, "AI summary saved"); }); log("Agent", "Saved summary", id); toast("Summary saved to ticket"); };
  const resolve = (id) => {
    upd(id, (t) => { t.st = "Resolved"; t.step = 3; return A(t, "Resolved and closed"); });
    notify(`Your ticket #${id} was resolved. A summary was sent to your email.`); log("Agent", "Resolved ticket", id); toast("Ticket resolved · requester notified");
  };

  /* Simulated RPA bot (rules-based, no real systems touched). */
  const triggerRpa = (id) => { setRpaId(id); setRpa({ pct: 72, state: "Running", log: RPA_LOG0 }); };
  const runRpa = () => {
    const id = rpaId, n = Math.ceil((100 - rpa.pct) / 7);
    const i = setInterval(() => setRpa((r) => {
      const pct = Math.min(100, r.pct + 7);
      if (pct >= 100) { clearInterval(i); return { pct, state: "Completed", log: [...r.log, [clock(), "Ticket updated", id]] }; }
      return { ...r, pct };
    }), 600);
    setTimeout(() => { upd(id, (t) => { t.rpa = true; return t; }); notify("RPA completed for #" + id); log("RPA Bot", "Credential reset", id); toast("Automation completed"); }, n * 600 + 80);
  };

  const togglePerm = (i, j) => { setPerm((p) => p.map((r, a) => (a === i ? r.map((v, b) => (b === j ? (v ? 0 : 1) : v)) : r))); log("Admin", "Changed permission", `row ${i + 1} · col ${j + 1}`); toast("Permission updated"); };
  const setUserRole = (i, r) => { setUsers((us) => us.map((u, a) => (a === i ? [u[0], u[1], r, u[3], u[4]] : u))); log("Admin", "Changed role", users[i][0] + " → " + r); toast("Role updated"); };

  const v = { role, setRole, tickets, notes, audit, perm, users, rpa, rpaId, msg, gq, setGq, createTicket, rerate, studentReply, acceptAi, ignoreAi, addNote, escalate, toggleElev, genSummary, saveSummary, resolve, triggerRpa, runRpa, togglePerm, setUserRole };
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
