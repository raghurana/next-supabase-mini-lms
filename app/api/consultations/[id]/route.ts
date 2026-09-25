import { createClient } from "@/lib/supabase/server";
import { rejectCrossSiteRequest } from "@/app/api/_lib/security";
import { isRecord } from "@/lib/utils";
import { NextResponse } from "next/server";
import { tryCatch } from "try-catch-util";

const consultationStatuses = ["scheduled", "completed", "cancelled"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleData?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { result, error: bodyError } = await tryCatch<unknown>(() =>
    request.json(),
  );
  if (bodyError || !isRecord(result)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const body = result;

  const updates: { scheduled_at?: string; status?: (typeof consultationStatuses)[number] } = {};
  if (typeof body.scheduledAt === "string") {
    const scheduledAt = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Invalid consultation datetime" }, { status: 400 });
    }
    updates.scheduled_at = scheduledAt.toISOString();
  }
  if (
    typeof body.status === "string" &&
    consultationStatuses.includes(body.status as (typeof consultationStatuses)[number])
  ) {
    updates.status = body.status as (typeof consultationStatuses)[number];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("consultations")
    .update(updates)
    .eq("id", id)
    .eq("student_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not update consultation" }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
