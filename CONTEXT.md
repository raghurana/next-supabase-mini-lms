# Mini-LMS Consultation Context

This context defines the shared language for student consultations in the mini-LMS.

## People and access

**Student**:
An authenticated user who books and manages their own consultations.
_Avoid_: Learner, attendee, customer

**Admin**:
An authenticated user with the `admin` role who can view every consultation in the system.
_Avoid_: Administrator user, staff member

## Consultations

**Consultation**:
A scheduled interaction belonging to one student and containing the attendee details, reason, and consultation datetime.
_Avoid_: Appointment, booking

**Completion**:
Whether a consultation is marked complete or incomplete by its owning student.
_Avoid_: Attendance, outcome

**Rescheduling**:
Changing the datetime of an existing consultation owned by the student.
_Avoid_: Rebooking

**Cancellation**:
Removing a consultation from the student’s upcoming commitments without deleting its record.
_Avoid_: Deletion
