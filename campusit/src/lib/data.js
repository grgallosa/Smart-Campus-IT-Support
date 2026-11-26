// Static config, sample data and workflow rules (Impact × Urgency → P1–P4, SLA targets, routing).
export const H = 36e5, M = 6e4;
export const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ---------- Priority + SLA ---------- */
export const PL = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low" };
export const PC = { 1: "#DC2626", 2: "#D97706", 3: "#71717A", 4: "#A1A1AA" };
export const TOT = { 1: 4 * H, 2: 8 * H, 3: 24 * H, 4: 72 * H };   // resolution targets
export const RT = { 1: 15 * M, 2: 30 * M, 3: 2 * H, 4: 8 * H };    // response targets
export const RTX = ["15 min", "30 min", "2 hours", "8 hours"];
export const RSX = ["4 hours", "8 hours", "24 hours", "3 days"];
export const MX = [[1, 2, 3], [2, 3, 4], [3, 4, 4]];               // MX[impact][urgency]
export const IMP = ["Campus-wide", "Department or building", "Single user"];
export const URG = ["High", "Medium", "Low"];
export const WHO = [["2", "Just me"], ["1", "My department or building"], ["0", "The whole campus"]];
export const HOW = [["0", "I can’t work or study"], ["1", "I have a workaround"], ["2", "It can wait"]];
export const LIFECYCLE = ["New", "Triaged", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"];
export const LIFE_IDX = { New: 0, Open: 0, Submitted: 0, Assigned: 2, "In Progress": 3, Escalated: 4, Resolved: 5 };

/* ---------- Catalogue ---------- */
export const CATS = ["Wi-Fi & Network", "Account & Password", "Email & Microsoft 365", "Software & Applications", "Computer & Hardware", "Printing", "Classroom Technology", "Student Systems"];
export const CHIPS = ["Wi-Fi", "Accounts", "Email", "Software", "Hardware", "Printing", "Classroom Tech", "Student Systems"];
export const TOPICS = [
  { chip: "Wi-Fi", title: "Connect to CampusWiFi", body: "Open Wi-Fi settings, pick CampusWiFi and sign in with your campus email and password. If it fails, forget the network and reconnect." },
  { chip: "Accounts", title: "Reset your campus password", body: "Use the self-service reset with your student ID and registered phone. A temporary password is sent to your campus email." },
  { chip: "Email", title: "Set up Microsoft 365 on your phone", body: "Install Outlook, add your campus email and approve the sign-in prompt in Microsoft Authenticator." },
  { chip: "Software", title: "Install campus software", body: "Open Software Center, search for the app (Adobe, MATLAB, SPSS) and select Install. Licences are assigned automatically." },
  { chip: "Hardware", title: "Borrow a loaner laptop", body: "Request one from the IT Help Desk with your student ID. Loans last up to 7 days, subject to availability." },
  { chip: "Printing", title: "Add a campus printer", body: "Connect to CampusWiFi, open the print portal and install the queue for your building. Sign in at the printer to release jobs." },
  { chip: "Classroom Tech", title: "Fix a projector with no signal", body: "Check the input source, reseat the HDMI cable, then restart the projector. Still blank? Create a ticket and note the room number." },
  { chip: "Student Systems", title: "Can’t log in to the student portal", body: "Clear your browser cache and try a private window. If many students are affected, it may be an outage." },
];
// Tier 0 self-service: quick fixes the assistant can give before a ticket is needed.
export const SOL = [
  { re: /wi-?fi|network|internet/i, steps: ["Open Wi-Fi settings and forget CampusWiFi.", "Reconnect and sign in with your campus email and password.", "Restart your device if it still won’t connect."] },
  { re: /password|log ?in|account/i, steps: ["Open the campus password reset page.", "Enter your student ID and confirm with your registered phone.", "Sign in with the temporary password and set a new one."] },
  { re: /print/i, steps: ["Make sure the printer shows online and has paper.", "Delete the stuck job from the print queue and send it again.", "Sign in at the printer to release the job."] },
  { re: /email|outlook|microsoft|365/i, steps: ["Sign out of Outlook and sign in again with your campus email.", "Approve the prompt in Microsoft Authenticator.", "Restart the app."] },
  { re: /projector|display|screen|hdmi/i, steps: ["Check the input source on the projector.", "Reseat the HDMI cable at both ends.", "Restart the projector."] },
];

/* ---------- Navigation (roles: s student, t Tier 1, u Tier 2, a admin) ---------- */
export const NAV = [
  { label: "Help Center", to: "/", icon: "LifeBuoy", roles: "sf" },
  { label: "My Tickets", to: "/tickets", icon: "Ticket", roles: "sf" },
  { label: "Scan QR / Report", to: "/report", icon: "QrCode", roles: "sf" },
  { label: "Agent Workspace", to: "/agent", icon: "Headset", roles: "tua", group: "Support" },
  { label: "Equipment Assets", to: "/assets", icon: "Boxes", roles: "tua", group: "Support" },
  { label: "SLA Monitor", to: "/sla", icon: "Timer", roles: "tua", group: "Support" },
  { label: "RPA Workflows", to: "/rpa", icon: "Bot", roles: "ua", group: "Automation" },
  { label: "Analytics", to: "/analytics", icon: "BarChart3", roles: "tua", group: "Insights" },
  { label: "Security", to: "/security", icon: "ShieldCheck", roles: "ua", group: "Insights" },
  { label: "Users & Roles", to: "/users", icon: "UserCog", roles: "a", group: "Insights" },
];

/* ---------- Users, roles, permissions ---------- */
export const ROLES = ["Admin", "Tier 1 Agent", "Tier 2 Agent", "Student", "Faculty"];
export const RL = ["Student", "Faculty", "Tier 1", "Tier 2", "Admin"];
export const PF = ["Submit ticket", "View own tickets", "View all tickets", "Change priority", "AI Agent-Assist", "RPA management", "User management", "Audit logs"];
export const PERM0 = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,1,1],[0,0,1,1,1],[0,0,1,1,1],[0,0,0,1,1],[0,0,0,0,1],[0,0,0,1,1]];
export const USERS = [
  ["Gina Reyes", "g••••••@student.edu", "Student", "Active", "2m ago"],
  ["Prof. D. Lim", "m•••@faculty.edu", "Faculty", "Active", "1h ago"],
  ["Marco Santos", "m••••••@campus.edu", "Tier 1 Agent", "Active", "now"],
  ["Rafael Cruz", "r•••••@campus.edu", "Tier 2 Agent", "Active", "12m ago"],
  ["Ana Lopez", "a•••@campus.edu", "Admin", "Active", "5m ago"],
  ["Jerome Dela Cruz", "j•••••@student.edu", "Student", "Suspended", "3d ago"],
];

/* ---------- Tickets ---------- */
export function makeTicket(o) {
  const p = MX[o.imp][o.urg], t0 = Date.now() - (o.ago || 0);
  return {
    id: "CIT-2026-" + o.id, who: o.who, issue: o.issue, imp: o.imp, urg: o.urg, p, st: o.st,
    t0, end: t0 + TOT[p], rend: t0 + RT[p], tot: TOT[p], as: o.as, tier: o.tier, cat: o.cat, step: o.step,
    desc: o.desc, loc: o.loc || "Main Campus", resp: !!o.resp, msgs: o.msgs || [], notes: o.notes || [],
    ai: "pending", sum: null, rpa: false, elev: false, act: o.act || [[clock(), "Ticket created"]], ...o.extra,
  };
}
export function seedTickets() {
  return [
    makeTicket({ id: 1038, who: "Prof. D. Lim", issue: "Projector not detected, Rm 304", imp: 1, urg: 0, st: "Assigned", ago: 7 * H + 42 * M, as: "R. Cruz", tier: "Tier 2", cat: "Classroom Technology", step: 1, desc: "Projector in Room 304 shows no signal before a 10:00 lecture.", loc: "Science Building, Rm 304", resp: 1 }),
    makeTicket({ id: 1035, who: "J. Mercado", issue: "Student portal login failure", imp: 0, urg: 0, st: "Escalated", ago: 4 * H + 12 * M, as: "R. Cruz", tier: "Tier 2", cat: "Student Systems", step: 2, desc: "Several students cannot log in to the student portal.", loc: "Online", resp: 1 }),
    makeTicket({ id: 1042, who: "G. Reyes", issue: "Cannot connect to CampusWiFi, Dorm B", imp: 2, urg: 0, st: "In Progress", ago: H + 17 * M + 42e3, as: "M. Santos", tier: "Tier 1", cat: "Network / Wi-Fi", step: 2, desc: "I can’t connect to CampusWiFi in Dorm B since this morning. Other devices work.", loc: "Dorm B, Room 212",
      msgs: [["Gina Reyes", "08:52", "Laptop shows “Can’t connect to this network”."]], notes: ["Same symptom as 3 tickets from Dorm B today."],
      act: [["08:51", "Ticket created"], ["08:52", "Triaged as P3 (impact × urgency)"], ["08:53", "Assigned to Tier 1 · M. Santos"]],
      extra: { rec: 1, sug: "Verify the user’s campus authentication and check whether other users in Dorm B are affected.", rep: "I’ve identified a potential network authentication issue. Please forget CampusWiFi on your device and reconnect with your campus login." } }),
    makeTicket({ id: 1041, who: "A. Tan", issue: "Library printer queue stuck", imp: 1, urg: 1, st: "New", ago: 40 * M, as: "Unassigned", tier: "Tier 1", cat: "Printing", step: 0, desc: "Print jobs on Library printer 2 stay queued.", loc: "Library, 2F" }),
    makeTicket({ id: 1039, who: "K. Villanueva", issue: "Password reset request", imp: 2, urg: 0, st: "In Progress", ago: 22 * H + 18 * M, as: "M. Santos", tier: "Tier 1", cat: "Account & Password", step: 2, desc: "Forgot my campus account password.", loc: "Online", resp: 1 }),
    makeTicket({ id: 1040, who: "Dr. P. Go", issue: "Microsoft 365 license request", imp: 2, urg: 2, st: "Assigned", ago: 2 * H, as: "L. Dizon", tier: "Tier 1", cat: "Email & Microsoft 365", step: 1, desc: "Need an additional Microsoft 365 license.", loc: "Faculty Office" }),
  ];
}
export const seedAudit = [
  ["IT Admin", "Viewed customer profile", "Profile · G. Reyes", "10:42 AM", "Authorized"],
  ["Agent", "Updated ticket", "CIT-2026-1042", "10:45 AM", "Authorized"],
  ["Student", "Viewed own ticket", "CIT-2026-1042", "10:48 AM", "Authorized"],
  ["Student", "Opened Agent Workspace", "/agent", "10:49 AM", "Denied"],
];
export const RPA_LOG0 = [
  ["09:41", "Request received", "Ticket CIT-2026-1039"], ["09:42", "Identity validated", "Student record match"],
  ["09:42", "Account system accessed", "Read-only lookup"], ["09:43", "Credential reset completed", "Temporary credential issued"],
  ["09:43", "User notification sent", "Email to student"],
];
export const RPA_STEPS = ["Ticket Created", "Identity Verification", "RPA Bot", "Credential Reset", "System Update", "User Notification", "Ticket Updated"];
