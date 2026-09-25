import { ConsultationBookingForm } from "@/app/dashboard/consultations/components/consultation-booking-form";
import { getAuthenticatedStudentId } from "@/app/dashboard/consultations/_lib/student";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const NewConsultationPage = () => (
  <Suspense
    fallback={
      <div className="w-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Loading booking form...
      </div>
    }
  >
    <NewConsultation />
  </Suspense>
);

const NewConsultation = async () => {
  const studentId = await getAuthenticatedStudentId();

  if (!studentId) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Book a consultation</h1>
      <p className="mt-4 text-muted-foreground">
        Share what you would like to discuss. Enter the consultation time as UTC.
      </p>
      <div className="mt-8">
        <ConsultationBookingForm />
      </div>
      <Link
        className="mt-4 inline-flex items-center rounded-md border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
        href="/dashboard/consultations"
      >
        ← Back to consultations
      </Link>
    </section>
  );
};

export default NewConsultationPage;
