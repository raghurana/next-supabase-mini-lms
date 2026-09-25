# 02: Book and view student consultations

## Parent spec
`.features/consultations/spec.md`

**What to build:** An authenticated student can book a consultation with the required attendee details, reason, and UTC datetime, then see their own consultations in the student dashboard.

**Blocked by:** 01: Establish consultation access boundaries

**Status:** ready-for-agent

- [x] An authenticated student can submit first name, last name, reason, and consultation datetime.
- [x] The consultation datetime is stored and displayed as UTC consistently.
- [x] A successful booking appears in the student’s consultation list.
- [x] The student dashboard does not show consultations owned by other students.
- [x] Invalid or incomplete booking details are rejected with an understandable validation message.
