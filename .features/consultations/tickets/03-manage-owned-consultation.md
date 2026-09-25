# 03: Manage an owned consultation

## Parent spec
`.features/consultations/spec.md`

**What to build:** From the student dashboard, a student can manage an owned consultation by changing its completion state, rescheduling it, or cancelling it without deleting its record.

**Blocked by:** 02: Book and view student consultations

**Status:** ready-for-agent

- [x] A student can mark an owned consultation complete.
- [x] A student can mark an owned consultation incomplete again.
- [x] A student can reschedule an owned consultation by changing its UTC datetime.
- [x] A student can cancel an owned consultation, and the consultation record remains available as cancelled history.
- [x] Management actions cannot affect another student’s consultation.
- [x] The dashboard reflects each updated state and datetime after the action succeeds.
