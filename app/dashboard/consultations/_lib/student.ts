import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const getAuthenticatedStudentId = async () => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth/login");
  }

  const studentId = claimsData.claims.sub;
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", studentId)
    .maybeSingle();

  return roleData?.role === "student" ? studentId : null;
};
