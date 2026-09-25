import { createClient } from "@/lib/supabase/server";
import { rejectCrossSiteRequest } from "@/app/api/_lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;

  const { email } = await request.json();
  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
