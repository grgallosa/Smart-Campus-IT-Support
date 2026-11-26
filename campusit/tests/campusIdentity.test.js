import test from "node:test";
import assert from "node:assert/strict";
import { lookupCampusIdentity, verifiedCampusRole, isStaffDemoAccount } from "../src/lib/campusIdentity.js";
test("active student and faculty records assign their own role", () => {
  assert.equal(verifiedCampusRole("CCAI-DEMO-STUDENT-01", true), "s");
  assert.equal(verifiedCampusRole("CCAI-DEMO-FACULTY-01", true), "f");
});
test("identity alone cannot confirm the simulated verification step", () => {
  assert.equal(verifiedCampusRole("CCAI-DEMO-STUDENT-01", false), null);
  assert.equal(verifiedCampusRole("CCAI-DEMO-STUDENT-01", "true"), null);
});
test("unknown, inactive, equipment and privilege tokens are rejected", () => {
  assert.equal(lookupCampusIdentity("CCAI-DEMO-INACTIVE-01").reason, "inactive");
  for (const token of ["PC-024", "a", "CCAI-DEMO-ADMIN-01", "", null]) {
    assert.equal(verifiedCampusRole(token, true), null);
  }
  assert.equal(verifiedCampusRole("CCAI-DEMO-INACTIVE-01", true), null);
});
test("staff demonstration has an independent entry path", () => {
  assert.equal(isStaffDemoAccount("a"), true);
  assert.equal(isStaffDemoAccount("t"), true);
  assert.equal(isStaffDemoAccount("s"), false);
  assert.equal(isStaffDemoAccount("f"), false);
});
