# Campus identity QR sign-in — prototype review

No separate CampusCare registration. An enrolled student or authorized faculty member is represented by an existing fictional campus record. Scan its identity QR (or select a sample), then simulate trusted campus verification. The directory determines the role; users cannot assign themselves admin through campus QR sign-in.

The ordinary successful login opens Help Center. An equipment QR deep link already opened at /#/report?asset=PC-024 is preserved through campus sign-in. Staff demo accounts have a separate, explicitly labeled presentation entry. Sign out ends the current in-memory session.

## Demo checklist
- Student sample: match active record, confirm verification, land in Help Center, see own tickets.
- Faculty sample: same journey, separate authorized ticket view.
- Inactive sample and unknown/equipment tokens: denied; audit records show denial (no raw token stored).
- Sign out and try an agent-only route while signed in as a student: access restricted.
- Open /#/report?asset=PC-024 while signed out; after campus verification, equipment ID remains prefilled.
- Try the camera on a browser supporting BarcodeDetector over HTTPS or localhost; otherwise use sample buttons or manual demo code.
- Staff sign-in: separate Tier 1, Tier 2, Admin examples.
- Run `node --test tests/campusIdentity.test.js` and `npm run build` in campusit; then test each browser flow.

## Boundary
This is a front-end simulation. All sample identity tokens and roles are public, and the confirmation button is not real verification. No connection to university records, real personal information, passwords, or production authentication. Production requires an authenticated campus identity provider (or signed short-lived QR challenge), secure sessions, server-side membership and RBAC checks, and real access auditing. Static ID QR codes must not grant access by themselves.
