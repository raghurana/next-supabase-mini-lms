import { type Consultation } from "@/types/consultations";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

const AdminConsultationsPage = () => (
  <Suspense
    fallback={
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Loading consultations...
        </p>
      </main>
    }
  >
    <AdminConsultations />
  </Suspense>
);

const AdminConsultations = async () => {
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

  if (roleError || roleData?.role !== "admin") {
    notFound();
  }

  const { data, error } = await supabase
    .from("consultations")
    .select("id, first_name, last_name, reason, scheduled_at, status")
    .order("scheduled_at", { ascending: true });
  const consultations = (data ?? []) as Consultation[];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Admin view
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">All consultations</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        A read-only view of every student consultation, with times shown in UTC.
      </p>
      <div className="mt-8 grid gap-3">
        {error ? (
          <p className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
            We could not load consultations. Please refresh and try again.
          </p>
        ) : consultations.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No consultations have been booked yet.
          </p>
        ) : (
          consultations.map((consultation) => (
            <article className="rounded-xl border bg-card p-5 shadow-sm" key={consultation.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {consultation.first_name} {consultation.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatConsultationDate(consultation.scheduled_at)} UTC
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                  {consultation.status}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {consultation.reason}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
};

const consultationDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const formatConsultationDate = (scheduledAt: string) =>
  consultationDateFormatter.format(new Date(scheduledAt));

export default AdminConsultationsPage;
