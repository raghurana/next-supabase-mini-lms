create schema if not exists app_functions;

revoke all on schema app_functions from public, anon, authenticated;

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student'
    constraint user_roles_role_check check (role in ('student', 'admin'))
);

create table public.consultations (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  reason text not null
    constraint consultations_reason_check
      check (char_length(btrim(reason)) between 1 and 2000),
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    constraint consultations_status_check
      check (status in ('scheduled', 'completed', 'cancelled'))
);

create index consultations_student_id_scheduled_at_idx
  on public.consultations (student_id, scheduled_at desc);

create index consultations_scheduled_at_idx
  on public.consultations (scheduled_at desc);

alter table public.user_roles enable row level security;
alter table public.consultations enable row level security;

revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.consultations from anon, authenticated;
revoke all on sequence public.consultations_id_seq from anon, authenticated;

grant select on table public.user_roles to authenticated;
grant select, insert, update on table public.consultations to authenticated;
grant usage, select on sequence public.consultations_id_seq to authenticated;
grant all on table public.user_roles to service_role;
grant all on table public.consultations to service_role;
grant all on sequence public.consultations_id_seq to service_role;

create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy consultations_select_authorized
on public.consultations
for select
to authenticated
using (
  (
    (select auth.uid()) = student_id
    and exists (
      select 1
      from public.user_roles
      where user_id = (select auth.uid())
        and role = 'student'
    )
  )
  or exists (
      select 1
      from public.user_roles
      where user_id = (select auth.uid())
        and role = 'admin'
  )
);

create policy consultations_students_insert_own
on public.consultations
for insert
to authenticated
with check (
  (select auth.uid()) = student_id
  and exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'student'
  )
);

create policy consultations_students_update_own
on public.consultations
for update
to authenticated
using (
  (select auth.uid()) = student_id
  and exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'student'
  )
)
with check (
  (select auth.uid()) = student_id
  and exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'student'
  )
);

create or replace function app_functions.prevent_cancelled_consultation_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'cancelled'
    and (new.status <> old.status or new.scheduled_at <> old.scheduled_at) then
    raise exception 'Cancelled consultations cannot be changed'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

revoke execute on function app_functions.prevent_cancelled_consultation_changes() from public, anon, authenticated;

create trigger prevent_cancelled_consultation_changes
before update on public.consultations
for each row execute function app_functions.prevent_cancelled_consultation_changes();

create or replace function app_functions.assign_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function app_functions.assign_default_user_role() from public, anon, authenticated;

create trigger assign_default_user_role
after insert on auth.users
for each row execute function app_functions.assign_default_user_role();
