import { createClient } from "@/lib/supabase/server";
import { rejectCrossSiteRequest } from "@/app/api/_lib/security";
import { isRecord } from "@/lib/utils";
import { NextResponse } from "next/server";
import { tryCatch } from "try-catch-util";

const getStudentId = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const studentId = data?.claims?.sub;

  if (error || !studentId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", studentId)
    .maybeSingle();

  if (roleData?.role !== "student") {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, studentId };
};

export async function POST(request: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;

  const auth = await getStudentId();
  if ("response" in auth) return auth.response;

  const { result, error: bodyError } = await tryCatch<unknown>(() =>
    request.json(),
  );
  if (bodyError || !isRecord(result)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const body = result;

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : "";
  const scheduledAtUtc = new Date(scheduledAt);

  if (
    !firstName ||
    !lastName ||
    !reason ||
    reason.length > 2000 ||
    !scheduledAt ||
    Number.isNaN(scheduledAtUtc.getTime())
  ) {
    return NextResponse.json({ error: "Invalid consultation details" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("consultations").insert({
    student_id: auth.studentId,
    first_name: firstName,
    last_name: lastName,
    reason,
    scheduled_at: scheduledAtUtc.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Could not book consultation" }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
