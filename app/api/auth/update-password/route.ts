import { createClient } from "@/lib/supabase/server";
import { rejectCrossSiteRequest } from "@/app/api/_lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;

  const { password } = await request.json();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
