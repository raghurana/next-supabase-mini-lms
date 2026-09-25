# Student Consultations

## Goal

Provide a minimal consultation workflow for students and a read-only system-wide view for admins.

## Student dashboard

An authenticated student can see their own consultations. Each consultation can be marked complete or incomplete.

The student can reschedule or cancel their own consultation. Rescheduling changes its datetime. Cancellation does not delete the consultation record.

## Booking

An authenticated student can create a consultation with these details:

- First name
- Last name
- Reason for consultation
- Datetime for consultation

Consultation datetimes use UTC.

## Admin view

An authenticated user with the `Admin` role can see a read-only list of all consultations across the system, including consultations belonging to other students.

## Access boundaries

- Students can see and manage only their own consultations.
- Admins can read all consultations.
- Admins do not need consultation-management actions in the admin view.

## Scope

This MVP does not add notifications, availability or conflict checking, search or filtering, cancellation reasons, reschedule history, or additional consultation metadata beyond what is required to support ownership and completion/cancellation state.
