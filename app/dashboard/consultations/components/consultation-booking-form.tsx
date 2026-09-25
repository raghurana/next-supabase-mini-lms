"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/lib/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/card";
import { Input } from "@/lib/ui/input";
import { Label } from "@/lib/ui/label";
import { type ConsultationFormValues } from "@/types/consultations";

export const ConsultationBookingForm = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<ConsultationFormValues>({
    firstName: "",
    lastName: "",
    reason: "",
    scheduledAt: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSuccess(false);
    setFormValues((currentValues) =>
      currentValues.scheduledAt ? currentValues : { ...currentValues, scheduledAt: getDefaultScheduledAt() },
    );
  }, []);

  const updateField = (field: keyof ConsultationFormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSuccess(false);

    const firstName = formValues.firstName.trim();
    const lastName = formValues.lastName.trim();
    const reason = formValues.reason.trim();
    const scheduledAt = formValues.scheduledAt;

    if (!firstName || !lastName || !reason || !scheduledAt) {
      setErrorMessage("Enter your name, reason, and a UTC consultation time.");
      return;
    }

    if (reason.length > 2000) {
      setErrorMessage("The consultation reason must be 2000 characters or fewer.");
      return;
    }

    const scheduledAtUtc = new Date(`${scheduledAt}:00Z`);

    if (Number.isNaN(scheduledAtUtc.getTime())) {
      setErrorMessage("Enter a valid consultation datetime in UTC.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        reason,
        scheduledAt: scheduledAtUtc.toISOString(),
      }),
    });

    if (!response.ok) {
      setErrorMessage("We could not book that consultation. Check the details and try again.");
      setIsSubmitting(false);
      return;
    }

    setFormValues({
      firstName: "",
      lastName: "",
      reason: "",
      scheduledAt: getDefaultScheduledAt(),
    });
    setIsSuccess(true);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                required
                value={formValues.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                required
                value={formValues.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for consultation</Label>
            <textarea
              id="reason"
              className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              maxLength={2000}
              required
              value={formValues.reason}
              onChange={(event) => updateField("reason", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scheduled-at">Consultation datetime (UTC)</Label>
            <Input
              id="scheduled-at"
              required
              type="datetime-local"
              value={formValues.scheduledAt}
              onChange={(event) => updateField("scheduledAt", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter the date and time as UTC.</p>
          </div>
          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {isSuccess ? (
            <p className="text-sm text-green-600" role="status">
              Consultation booked successfully.
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Book consultation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const getDefaultScheduledAt = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
