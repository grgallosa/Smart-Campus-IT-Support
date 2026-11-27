import { createContext, useContext, useRef, useState } from "react";
import { MX, TOT, RT, clock, makeTicket, seedTickets, seedAudit, PERM0, USERS, RPA_STEPS, RPA_DET, AI, genericAi, WHO_ME } from "@/lib/data";

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
  const [rpa, setRpa] = useState({ pct: 0, state: "Idle", log: [], fail: false });
  const [rpaId, setRpaId] = useState(null);
  const [msg, setMsg] = useState("");
  const [gq, setGq] = useState("");
  const seq = useRef(0), tm = useRef();
  const [rev, setRev] = useState({}), [defl, setDefl] = useState(0);
  const COL = { s: 0, t: 1, u: 2, a: 3 }, can = (f) => !!perm[f][COL[role]];
  // Queue ownership: Tier 1 works Tier 1 tickets, Tier 2 works Tier 2 tickets; you act only on tickets you have claimed. Admin is read-only.
  const short = (n) => n[0] + ". " + n.split(" ")[1], me = short(U[role][0]);
  const own = (t) => (role === "t" ? t.tier === "Tier 1" : role === "u" ? t.tier === "Tier 2" : false), mine = (t) => own(t) && t.as === me;

  const toast = (m) => { setMsg(m); clearTimeout(tm.current); tm.current = setTimeout(() => setMsg(""), 2400); };
  const log = (u, a, r, res = "Authorized") => setAudit((x) => [[u, a, r || "—", clock(), res], ...x]);
  const notify = (m) => setNotes((n) => [m, ...n]);
  const get = (id) => tickets.find((t) => t.id === id);
  const upd = (id, fn) => setTickets((ts) => ts.map((t) => (t.id === id ? fn({ ...t, act: [...t.act], msgs: [...t.msgs], notes: [...t.notes] }) : t)));
  const A = (t, x) => { t.act.push([clock(), x]); return t; };
  /** One escalation path for every trigger (manual button, P1/P2 rule, triage): moves ownership to the Tier 2 queue, priority unchanged. */
  const toT2 = (x, why) => { x.tier = "Tier 2"; x.as = "Tier 2 queue"; x.st = "Escalated"; return A(x, why); };

  const createTicket = (f) => {
    const p = MX[f.imp][f.urg], hi = p < 3;
    const t = makeTicket({
      id: 1043 + seq.current++, who: WHO_ME[role], issue: f.subject || "IT support request", imp: f.imp, urg: f.urg,
      st: "Assigned", ago: 0, as: "Tier 1 queue", tier: "Tier 1", cat: f.cat, step: 1, extra: { triaged: false },
      desc: f.desc || f.subject, loc: f.loc, dev: f.dev, att: f.att,
      act: [[clock(), "Ticket created"], [clock(), `Triaged as P${p} (impact × urgency, from requester answers; agent to verify)`], [clock(), "Routed to Tier 1 for triage (priority is requester-suggested until an agent confirms it)"]],
    });
    setTickets((ts) => [t, ...ts]); notify("Ticket #" + t.id + " created"); log(U[role][1], "Submitted ticket", t.id); toast("Ticket " + t.id + " created");
    return t;
  };

  /** Priority comes from Impact × Urgency. Re-rating restarts SLA from creation; P1/P2 auto-route to Tier 2. */
  const rerate = (id, imp, urg) => {
    const t = get(id), np = MX[imp][urg], o = t.p, route = np !== o && np < 3 && t.tier === "Tier 1";
    upd(id, (x) => {
      x.imp = imp; x.urg = urg; x.triaged = true;
      if (np !== o) {
        x.p = np; x.tot = TOT[np]; x.end = x.t0 + TOT[np]; x.rend = x.t0 + RT[np];
        A(x, `Re-rated P${o} → P${np} (impact × urgency); SLA recalculated from creation`);
        if (route) toT2(x, "Escalated to Tier 2 (P1/P2 rule)");
      }
      return x;
    });
    if (np === o) return toast("Priority unchanged");
    log(U[role][1], "Re-rated priority", id);
    if (route) { notify(`#${id} re-rated P${np} and routed to Tier 2`); toast(`Re-rated P${np} · routed to Tier 2`); } else toast("Re-rated to P" + np);
  };

  const claim = (id) => { upd(id, (t) => { t.as = me; if (t.st === "New") t.st = "Assigned"; return A(t, "Claimed by " + me); }); log(U[role][1], "Claimed ticket", id); toast("Ticket claimed"); };
  const closeTicket = (id) => { upd(id, (t) => { t.st = "Closed"; t.step = 4; return A(t, "Closed (requester confirmed the fix)"); }); log(U[role][1], "Confirmed fix · ticket closed", id); toast("Ticket closed"); };
  const reopen = (id) => { upd(id, (t) => { t.st = "In Progress"; t.step = 2; t.sum = null; t.done = null; return A(t, "Reopened by requester: not fixed"); }); notify(`#${id} reopened by requester`); log(U[role][1], "Reopened ticket", id); toast("Ticket reopened"); };
  /** Tier 1 verifies the requester's priority. Confirming applies the P1/P2 → Tier 2 rule. */
  const confirmTriage = (id) => {
    const t = get(id), route = t.p < 3 && t.tier === "Tier 1";
    upd(id, (x) => { x.triaged = true; A(x, `Priority P${x.p} confirmed by agent`); if (route) toT2(x, "Escalated to Tier 2 (P1/P2 rule)"); return x; });
    log(U[role][1], "Confirmed priority", id); if (route) notify(`#${id} confirmed P${t.p} and routed to Tier 2`); toast(route ? "Confirmed · routed to Tier 2" : "Priority confirmed");
  };
  const studentReply = (id, text) => { upd(id, (t) => { t.msgs.push([U[role][0], clock(), text]); return t; }); toast("Reply sent"); };
  const acceptAi = (id, text) => {
    upd(id, (t) => {
      t.ai = "accepted"; t.resp = true; t.rep = text;
      if (["New", "Open", "Submitted", "Assigned"].includes(t.st)) t.st = "In Progress";
      t.step = Math.max(t.step, 2); t.msgs.push([U[role][0], clock(), text]);
      return A(t, "Agent approved AI suggestion and replied");
    });
    notify("Update on #" + id + ": agent replied"); log(U[role][1], "Approved AI suggestion", id); toast("Reply sent to requester");
  };
  const ignoreAi = (id) => { upd(id, (t) => { t.ai = "ignored"; return A(t, "Agent ignored AI suggestion"); }); log(U[role][1], "Ignored AI suggestion", id); toast("Suggestion ignored"); };
  const addNote = (id, x) => { upd(id, (t) => { t.notes.push(x); return A(t, "Internal note added"); }); log(U[role][1], "Added internal note", id); };
  const escalate = (id) => {
    upd(id, (t) => toT2(t, "Escalated to Tier 2 by agent (priority unchanged)"));
    notify(`#${id} escalated to Tier 2`); log(U[role][1], "Escalated to Tier 2", id); toast("Escalated to Tier 2");
  };
  const toggleElev = (id) => upd(id, (t) => { t.elev = !t.elev; return t; });
  const genSummary = (id) => upd(id, (t) => { const a = AI[id] || genericAi(t); t.sum = { ...a.sum, saved: false }; return t; });
  const saveSummary = (id, patch) => { upd(id, (t) => { t.sum = { ...t.sum, ...patch, saved: true }; return A(t, "AI summary saved"); }); log(U[role][1], "Saved summary", id); toast("Summary saved to ticket"); };
  const resolve = (id) => {
    upd(id, (t) => { t.st = "Resolved"; t.step = 3; t.done = Date.now(); return A(t, "Resolved (awaiting requester confirmation)"); });
    notify(`Your ticket #${id} was resolved. Please confirm it is fixed so we can close it.`); log(U[role][1], "Resolved ticket", id); toast("Ticket resolved · requester notified");
  };

  /* Simulated RPA bot: rule-gated, agent-approved, with a failure branch (no real systems touched). */
  const triggerRpa = (id) => { setRpaId(id); setRpa({ pct: 17, state: "Awaiting approval", fail: false, log: [[clock(), RPA_STEPS[0], RPA_DET[0], "Success"]] }); log(U[role][1], "Triggered RPA (password-reset rule)", id); };
  const setRpaFail = (f) => setRpa((r) => ({ ...r, fail: f }));
  const runRpa = () => {
    const id = rpaId, fail = rpa.fail; let s = 0;
    setRpa((r) => ({ ...r, state: "Running", log: [...r.log, [clock(), "Agent approval", U[role][0] + " approved the run", "Success"]] })); log(U[role][1], "Approved RPA run", id);
    const i = setInterval(() => {
      s++;
      if (fail && s === 1) { clearInterval(i); setRpa((r) => ({ ...r, state: "Needs human review", log: [...r.log, [clock(), RPA_STEPS[1], "Student ID / phone mismatch: bot stopped, no changes made", "Failed"]] })); upd(id, (t) => A(t, "RPA stopped at identity check: needs human review")); log("RPA Bot", "Stopped: identity mismatch", id, "Blocked"); toast("Bot stopped · human review needed"); return; }
      setRpa((r) => ({ ...r, pct: Math.round(((s + 1) / 6) * 100), state: s === 5 ? "Completed" : "Running", log: [...r.log, [clock(), RPA_STEPS[s], RPA_DET[s], "Success"]] }));
      if (s === 5) { clearInterval(i); upd(id, (t) => { t.rpa = true; if (t.st !== "Resolved") t.st = "In Progress"; return A(t, "RPA reset credential (agent-approved)"); }); notify("RPA completed for #" + id); log("RPA Bot", "Credential reset", id); toast("Automation completed"); }
    }, 700);
  };
  const reveal = (id, why) => { setRev((r) => ({ ...r, [id]: why })); log(U[role][1], "Revealed PII (reason: " + why + ")", id); toast("PII revealed · logged"); };
  const deflect = () => { setDefl((n) => n + 1); log(U[role][1], "Self-resolved via Tier 0 AI (deflected)"); toast("Great, no ticket needed"); };

  const togglePerm = (i, j) => { setPerm((p) => p.map((r, a) => (a === i ? r.map((v, b) => (b === j ? (v ? 0 : 1) : v)) : r))); log("Admin", "Changed permission", `row ${i + 1} · col ${j + 1}`); toast("Permission updated"); };
  const setUserRole = (i, r) => { setUsers((us) => us.map((u, a) => (a === i ? [u[0], u[1], r, u[3], u[4]] : u))); log("Admin", "Changed role", users[i][0] + " → " + r); toast("Role updated"); };

  const v = { role, setRole, tickets, notes, audit, perm, users, rpa, rpaId, msg, gq, setGq, createTicket, rerate, studentReply, acceptAi, ignoreAi, addNote, escalate, toggleElev, genSummary, saveSummary, resolve, triggerRpa, runRpa, togglePerm, setUserRole, confirmTriage, claim, closeTicket, reopen, own, mine, me, can, log, rev, reveal, defl, deflect, setRpaFail };
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
