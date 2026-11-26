// Fictional campus directory for the front-end prototype. No real university data.
export const CAMPUS_DEMO = Object.freeze([
  Object.freeze({ token: "CCAI-DEMO-STUDENT-01", role: "s", name: "Gina Reyes", status: "active" }),
  Object.freeze({ token: "CCAI-DEMO-FACULTY-01", role: "f", name: "Prof. D. Lim", status: "active" }),
  Object.freeze({ token: "CCAI-DEMO-INACTIVE-01", role: "s", name: "Inactive sample account", status: "inactive" }),
]);

// Accept only exact fictional identity tokens; never interpret equipment tags or user-supplied roles.
export function lookupCampusIdentity(raw) {
  const token = typeof raw === "string" ? raw.trim() : "";
  const record = CAMPUS_DEMO.find(entry => entry.token === token);
  if (!record) return { ok: false, reason: "unknown" };
  if (record.status !== "active") return { ok: false, reason: "inactive" };
  return { ok: true, record };
}

export function verifiedCampusRole(raw, verificationConfirmed) {
  const result = lookupCampusIdentity(raw);
  return result.ok && verificationConfirmed === true ? result.record.role : null;
}

export const isStaffDemoAccount = role => ["t", "u", "a"].includes(role);
