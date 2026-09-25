# 04: View all consultations as an admin

## Parent spec
`.features/consultations/spec.md`

**What to build:** An authenticated admin can open a read-only consultation view containing consultations from every student, while non-admin users cannot access the system-wide view.

**Blocked by:** 01: Establish consultation access boundaries

**Status:** ready-for-agent

- [x] An authenticated admin can see consultations belonging to multiple students in one read-only list.
- [x] The list includes attendee names, reason, consultation datetime, and completion/cancellation state.
- [x] The admin view provides no consultation-management actions.
- [x] A student cannot access the admin consultation view or use it to see another student’s consultation.
- [x] Cancelled consultations remain visible to admins as historical records.
