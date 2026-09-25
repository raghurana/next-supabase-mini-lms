export type ConsultationStatus = "scheduled" | "completed" | "cancelled";

export type Consultation = {
  id: number;
  first_name: string;
  last_name: string;
  reason: string;
  scheduled_at: string;
  status: ConsultationStatus;
};

export type ConsultationUpdate = Partial<
  Pick<Consultation, "scheduled_at" | "status">
>;

export type ConsultationFormValues = {
  firstName: string;
  lastName: string;
  reason: string;
  scheduledAt: string;
};
