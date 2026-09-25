begin;

select plan(23);

select ok(
  has_table_privilege('authenticated', 'public.user_roles', 'select')
  and not has_table_privilege('authenticated', 'public.user_roles', 'insert,update,delete'),
  'authenticated users can read, but cannot change, role assignments'
);

select ok(
  has_table_privilege('authenticated', 'public.consultations', 'select,insert,update')
  and not has_table_privilege('authenticated', 'public.consultations', 'delete'),
  'authenticated users can manage consultations without deleting audit history'
);

select ok(
  not has_table_privilege('anon', 'public.consultations', 'select,insert,update,delete'),
  'anonymous users have no consultation privileges'
);

select ok(
  not has_table_privilege('anon', 'public.user_roles', 'select,insert,update,delete'),
  'anonymous users have no role-assignment privileges'
);

select ok(
  has_sequence_privilege('authenticated', 'public.consultations_id_seq', 'usage,select')
  and not has_sequence_privilege('authenticated', 'public.consultations_id_seq', 'update'),
  'authenticated users have only the sequence privileges needed to book'
);

select ok(
  not has_sequence_privilege('anon', 'public.consultations_id_seq', 'usage,select,update'),
  'anonymous users have no consultation sequence privileges'
);

insert into auth.users (instance_id, id, aud, role, email)
values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-4333-8333-333333333333',
  'authenticated',
  'authenticated',
  'other-student@example.com'
);

insert into public.consultations (
  student_id,
  first_name,
  last_name,
  reason,
  scheduled_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Stu',
    'Dent',
    'Own consultation',
    '2030-01-01 09:00:00+00'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Other',
    'Student',
    'Other consultation',
    '2030-01-02 09:00:00+00'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

select results_eq(
  $$select role from public.user_roles$$,
  array['student'],
  'a student can read only their own role'
);

select results_eq(
  $$select reason from public.consultations order by reason$$,
  array['Own consultation'],
  'a student sees only their own consultations'
);

select lives_ok(
  $$insert into public.consultations (student_id, first_name, last_name, reason, scheduled_at)
    values ('11111111-1111-4111-8111-111111111111', 'Stu', 'Dent', 'New consultation', '2030-01-03 09:00:00+00')$$,
  'a student can book their own consultation'
);

select throws_ok(
  $$insert into public.consultations (student_id, first_name, last_name, reason, scheduled_at)
    values ('33333333-3333-4333-8333-333333333333', 'Other', 'Student', 'Forbidden booking', '2030-01-04 09:00:00+00')$$,
  '42501',
  null,
  'a student cannot book for another user'
);

select lives_ok(
  $$update public.consultations set scheduled_at = '2030-02-01 09:00:00+00' where reason = 'Own consultation'$$,
  'a student can reschedule their own consultation'
);

select lives_ok(
  $$update public.consultations set status = 'completed' where reason = 'Own consultation'$$,
  'a student can mark their own consultation complete'
);

select lives_ok(
  $$update public.consultations set status = 'scheduled' where reason = 'Own consultation'$$,
  'a student can mark their own consultation incomplete'
);

select lives_ok(
  $$update public.consultations set status = 'cancelled' where reason = 'Own consultation'$$,
  'a student can cancel their own consultation without deleting it'
);

select throws_ok(
  $$update public.consultations
    set scheduled_at = '2030-03-01 09:00:00+00'
    where reason = 'Own consultation'$$,
  '23514',
  'Cancelled consultations cannot be changed',
  'a student cannot reschedule a cancelled consultation'
);

select throws_ok(
  $$update public.consultations
    set student_id = '33333333-3333-4333-8333-333333333333'
    where reason = 'Own consultation'$$,
  '42501',
  null,
  'a student cannot transfer ownership of their consultation'
);

select results_eq(
  $$update public.consultations set status = 'cancelled' where reason = 'Other consultation' returning id$$,
  array[]::bigint[],
  'a student cannot update another student consultation'
);

select throws_ok(
  $$delete from public.consultations where reason = 'Own consultation'$$,
  '42501',
  null,
  'a student cannot delete consultation history'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);

select results_eq(
  $$select reason from public.consultations where reason in ('Own consultation', 'Other consultation') order by reason$$,
  array['Other consultation', 'Own consultation'],
  'an admin can see consultations across the system'
);

select results_eq(
  $$select status from public.consultations where reason = 'Own consultation'$$,
  array['cancelled'],
  'an admin can see cancelled consultations as historical records'
);

select throws_ok(
  $$insert into public.consultations (student_id, first_name, last_name, reason, scheduled_at)
    values ('22222222-2222-4222-8222-222222222222', 'Ada', 'Min', 'Admin booking', '2030-01-05 09:00:00+00')$$,
  '42501',
  null,
  'an admin read role does not grant student booking permissions'
);

select results_eq(
  $$update public.consultations
    set status = 'completed'
    where reason = 'Other consultation'
    returning id$$,
  array[]::bigint[],
  'an admin cannot update consultations through the read boundary'
);

select throws_ok(
  $$delete from public.consultations where reason = 'Other consultation'$$,
  '42501',
  null,
  'an admin cannot delete consultation history'
);

select * from finish();
rollback;
