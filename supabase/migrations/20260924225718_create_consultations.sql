SET local check_function_bodies = off;

CREATE SCHEMA "app_functions";

CREATE TABLE "public"."consultations" (
  "id"           bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "student_id"   uuid                     NOT NULL,
  "first_name"   text                     NOT NULL,
  "last_name"    text                     NOT NULL,
  "reason"       text                     NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "status"       text                     NOT NULL DEFAULT 'scheduled'::text,
  CONSTRAINT "consultations_pkey" PRIMARY KEY (id),
  CONSTRAINT "consultations_reason_check" CHECK (((char_length(btrim(reason)) >= 1) AND (char_length(btrim(reason)) <= 2000))),
  CONSTRAINT "consultations_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."consultations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_roles" (
  "user_id" uuid NOT NULL,
  "role"    text NOT NULL DEFAULT 'student'::text,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY (user_id),
  CONSTRAINT "user_roles_role_check" CHECK ((role = ANY (ARRAY['student'::text, 'admin'::text])))
);

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_functions.assign_default_user_role()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

ALTER TABLE "public"."consultations"
  ADD CONSTRAINT "consultations_student_id_fkey" FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_roles"
  ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX consultations_scheduled_at_idx ON public.consultations USING btree (scheduled_at DESC);

CREATE INDEX consultations_student_id_scheduled_at_idx ON public.consultations USING btree (student_id, scheduled_at DESC);

CREATE TRIGGER assign_default_user_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app_functions.assign_default_user_role();

CREATE POLICY "consultations_students_insert_own" ON "public"."consultations"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((( SELECT auth.uid() AS uid) = student_id) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'student'::text))))));

CREATE POLICY "consultations_select_authorized" ON "public"."consultations"
  FOR SELECT
  TO "authenticated"
  USING ((((( SELECT auth.uid() AS uid) = student_id) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'student'::text))))) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'admin'::text))))));

CREATE POLICY "consultations_students_update_own" ON "public"."consultations"
  FOR UPDATE
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = student_id) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'student'::text))))))
  WITH CHECK (((( SELECT auth.uid() AS uid) = student_id) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'student'::text))))));

CREATE POLICY "user_roles_select_own" ON "public"."user_roles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

REVOKE ALL ON FUNCTION "app_functions"."assign_default_user_role"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "app_functions"."assign_default_user_role"() TO "postgres";

GRANT CREATE, USAGE ON SCHEMA "app_functions" TO "postgres";

REVOKE ALL ON TABLE "public"."consultations" FROM "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."consultations" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."consultations" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."user_roles" FROM "authenticated";

GRANT SELECT ON TABLE "public"."user_roles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_roles" TO "postgres", "service_role";

-- The local stack can auto-grant public-table privileges after CREATE TABLE.
-- Keep signed-out clients out, and restrict the identity sequence to the
-- operations required for authenticated inserts.
REVOKE ALL ON TABLE "public"."consultations" FROM "anon";
REVOKE ALL ON TABLE "public"."user_roles" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."consultations_id_seq" FROM "anon", "authenticated";
GRANT USAGE, SELECT ON SEQUENCE "public"."consultations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."consultations_id_seq" TO "service_role";
