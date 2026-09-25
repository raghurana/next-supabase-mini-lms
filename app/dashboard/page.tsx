import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

const DashboardPage = () => (
  <Suspense fallback={null}>
    <DashboardRedirect />
  </Suspense>
);

const DashboardRedirect = async () => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", claimsData.claims.sub)
    .maybeSingle();

  if (roleError || !roleData?.role) {
    notFound();
  }

  redirect(
    roleData.role === "admin" ? "/admin/consultations" : "/dashboard/consultations",
  );
};

export default DashboardPage;
