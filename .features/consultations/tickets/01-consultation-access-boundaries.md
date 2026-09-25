# 01: Establish consultation access boundaries

## Parent spec
`.features/consultations/spec.md`

**What to build:** Consultation persistence and authorization rules that enforce the consultation ownership and admin-read boundaries for the workflow.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Consultation records store the owning student, attendee names, reason, UTC consultation datetime, and completion/cancellation state.
- [x] Students can read, create, and update only their own consultations.
- [x] Admins can read consultations belonging to every student but cannot create, update, or delete consultations through the consultation access boundary.
- [x] Authenticated users cannot delete consultation records, preserving cancelled consultation history.
- [x] Automated database checks cover student isolation, admin read access, ownership enforcement, and deletion prevention.
