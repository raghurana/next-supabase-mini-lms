SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION app_functions.prevent_cancelled_consultation_changes()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if old.status = 'cancelled'
    and (new.status <> old.status or new.scheduled_at <> old.scheduled_at) then
    raise exception 'Cancelled consultations cannot be changed'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$function$;

CREATE TRIGGER prevent_cancelled_consultation_changes
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION app_functions.prevent_cancelled_consultation_changes();

REVOKE ALL ON FUNCTION "app_functions"."prevent_cancelled_consultation_changes"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "app_functions"."prevent_cancelled_consultation_changes"() TO "postgres";
