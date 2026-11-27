# CampusIT — Smart Campus IT Support (frontend prototype)

React + Vite + Tailwind CSS + shadcn-style components (Radix UI) + Lucide + React Router + Recharts.
No backend: all data is in memory (`src/store.jsx`), seeded from `src/lib/data.js`.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Demo flow
1. **Student**: Help Center → chat "I can't connect to campus Wi-Fi" → *Still not working* → fill the form → ticket created in the **Tier 1 queue**, priority is *requester-suggested*.
2. **Tier 1 Agent**: Agent Workspace → open the new ticket → *Claim ticket* → *Confirm P#* (P1/P2 escalates to Tier 2). Or open CIT-2026-1042 → *Apply* the AI re-rating (impact → P2, escalates to Tier 2).
3. **Tier 1 Agent**: open CIT-2026-1039 (password reset) → *Claim* → *Trigger password-reset bot* → *Approve & run* (try *Simulate identity mismatch* for the failure path) → back on the ticket: *ACW summary (1-click)* → *Save* → *Resolve & close*.
4. **Tier 2 Agent**: sees only Tier 2 tickets (e.g. 1038, 1035, escalated 1042) → *Claim* → act → resolve. *Reveal* masked PII needs a typed reason (audit-logged).
5. **Student** → My Tickets → open the resolved ticket → *Yes, close ticket* (or *No, reopen*).
6. **Admin**: read-only on tickets; Users & Roles (toggle a permission and watch access change), Security, RAID & AI Disclosure. Open `/#/security` as Student to see a logged denial.

## Workflow rules (src/lib/data.js)
- Priority = Impact × Urgency (`MX`), P1–P4. P1/P2 route to Tier 2, P3/P4 to Tier 1.
- SLA targets: P1 15 min / 4 h · P2 30 min / 8 h · P3 2 h / 24 h · P4 8 h / 3 days (`RT`, `TOT`).
- Re-rating restarts the SLA from ticket creation. Escalation (manual, P1/P2 rule or triage) always lands in the Tier 2 queue with status Escalated; priority never changes. Agents act only on tickets in their tier that they have claimed; Admin is read-only. Lifecycle ends Resolved → Closed when the requester confirms.
- SLA timers count calendar time (24×7) for every priority. At risk = under 25% of the target time left; a breach flags the ticket for escalation.
- AI suggests, the agent decides: Accept / Edit / Ignore. Nothing is sent automatically.

## Structure
```
src/
  main.jsx, App.jsx          router, layout, RBAC route guard
  store.jsx                  in-memory state + actions (tickets, audit, RPA, permissions)
  index.css                  design tokens (light + .dark) and table styles
  lib/                       data.js (rules + sample data), hooks.js, utils.js
  components/ui/             button, input, card (Section), tabs, switch, dialog
  components/                Sidebar, Topbar, Badges, Sla, Metrics, Lifecycle, ChatAssistant,
                             TicketForm, AiPanel, TicketsTable, Toaster
  pages/                     HelpCenter, MyTickets, TrackTicket, AgentWorkspace, SlaMonitor,
                             Rpa, Analytics, Security, UsersRoles
```

## Notes
- Router is `HashRouter` (works on any static host). Swap to `BrowserRouter` in `main.jsx` if you prefer clean URLs.
- Colors are CSS variables in `index.css`; Tailwind maps them in `tailwind.config.js`. Blue is for interaction/brand only; green/amber/red only for status.
- Roles: `s` student, `t` Tier 1, `u` Tier 2, `a` admin (see `NAV` and `Guard` in `App.jsx`).
