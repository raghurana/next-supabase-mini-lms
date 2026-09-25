import { ConsultationList } from "@/app/dashboard/consultations/components/consultation-list";
import { getAuthenticatedStudentId } from "@/app/dashboard/consultations/_lib/student";
import { createClient } from "@/lib/supabase/server";
import { type Consultation } from "@/types/consultations";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const ConsultationsPage = () => (
  <Suspense
    fallback={
      <div className="w-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Loading your consultations...
      </div>
    }
  >
    <StudentConsultations />
  </Suspense>
);

const StudentConsultations = async () => {
  const studentId = await getAuthenticatedStudentId();

  if (!studentId) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select("id, first_name, last_name, reason, scheduled_at, status")
    .order("scheduled_at", { ascending: true });
  const consultations = (data ?? []) as Consultation[];

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Student dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Consultations</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Your consultation schedule, with every time shown in UTC.
          </p>
        </div>
        <Link
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          href="/dashboard/consultations/new"
        >
          Book a consultation
        </Link>
      </div>
      <div className="mt-8">
        {error ? (
          <p className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
            We could not load your consultations. Please refresh and try again.
          </p>
        ) : consultations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No consultations booked yet.
          </div>
        ) : (
          <ConsultationList consultations={consultations} />
        )}
      </div>
    </section>
  );
};

export default ConsultationsPage;
