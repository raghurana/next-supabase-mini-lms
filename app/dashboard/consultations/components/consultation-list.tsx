"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clock3, Trash2 } from "lucide-react";

import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Label } from "@/lib/ui/label";
import {
  type Consultation,
  type ConsultationStatus,
  type ConsultationUpdate,
} from "@/types/consultations";

type ConsultationListProps = {
  consultations: readonly Consultation[];
};

export const ConsultationList = ({ consultations }: ConsultationListProps) => (
  <div className="grid gap-3">
    {consultations.map((consultation) => (
      <ConsultationCard consultation={consultation} key={consultation.id} />
    ))}
  </div>
);

type ConsultationCardProps = {
  consultation: Consultation;
};

const ConsultationCard = ({ consultation }: ConsultationCardProps) => {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState(
    toUtcInputValue(consultation.scheduled_at),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateConsultation = async (updates: ConsultationUpdate) => {
    setErrorMessage(null);
    setIsUpdating(true);

    const response = await fetch(`/api/consultations/${consultation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledAt: updates.scheduled_at,
        status: updates.status,
      }),
    });

    if (!response.ok) {
      setErrorMessage("We could not update this consultation. Please try again.");
      setIsUpdating(false);
      return;
    }

    if (updates.scheduled_at) {
      setScheduledAt(toUtcInputValue(updates.scheduled_at));
    }
    setIsUpdating(false);
    router.refresh();
  };

  const handleReschedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const scheduledAtUtc = new Date(`${scheduledAt}:00Z`);

    if (!scheduledAt || Number.isNaN(scheduledAtUtc.getTime())) {
      setErrorMessage("Enter a valid consultation datetime in UTC.");
      return;
    }

    await updateConsultation({ scheduled_at: scheduledAtUtc.toISOString() });
  };

  const handleStatusChange = async (status: ConsultationStatus) => {
    await updateConsultation({ status });
  };

  return (
    <article className="rounded-xl border bg-card p-5 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {consultation.first_name} {consultation.last_name}
          </h3>
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
      {consultation.status !== "cancelled" ? (
        <div className="mt-5 border-t pt-4">
          <form className="flex flex-wrap items-end gap-3" onSubmit={handleReschedule}>
            <div className="grid gap-2">
              <Label htmlFor={`scheduled-at-${consultation.id}`}>
                Reschedule (UTC)
              </Label>
              <Input
                id={`scheduled-at-${consultation.id}`}
                required
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            </div>
            <Button disabled={isUpdating} type="submit" variant="outline">
              <Clock3 aria-hidden="true" />
              Reschedule
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => handleStatusChange("cancelled")}
              type="button"
              className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
              variant="destructive"
            >
              <Trash2 aria-hidden="true" />
              Cancel consultation
            </Button>
            {consultation.status === "completed" ? (
              <Button
                disabled={isUpdating}
                onClick={() => handleStatusChange("scheduled")}
                type="button"
                className="ml-auto"
                variant="secondary"
              >
                <Check aria-hidden="true" />
                Mark incomplete
              </Button>
            ) : (
              <Button
                disabled={isUpdating}
                onClick={() => handleStatusChange("completed")}
                type="button"
                className="ml-auto"
                variant="secondary"
              >
                <Check aria-hidden="true" />
                Mark complete
              </Button>
            )}
          </form>
          {errorMessage ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

const consultationDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const formatConsultationDate = (scheduledAt: string) =>
  consultationDateFormatter.format(new Date(scheduledAt));

const toUtcInputValue = (scheduledAt: string) =>
  new Date(scheduledAt).toISOString().slice(0, 16);
