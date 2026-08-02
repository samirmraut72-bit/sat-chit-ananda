"use client";

import Link from "next/link";
import { useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  ticketQuantity: "1",
  consent: false,
  website: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ticketQuantity: "1",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Registration could not be completed.",
        );
      }

      setRegistration(result.registration);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (registration) {
    return (
      <main className="registrationShell">
        <section className="confirmationCard">
          <div className="successIcon">✓</div>

          <p className="sectionEyebrow">Registration confirmed</p>

          <h1>Welcome, {registration.fullName}</h1>

          <p className="confirmationLead">
            Your individual place at Sat-Chit-Ananda has been reserved.
          </p>

          <div className="ticket">
            <div className="ticketTop">
              <div>
                <small>EVENT</small>
                <strong>Sat-Chit-Ananda</strong>
              </div>

              <span className="freeBadge">FREE</span>
            </div>

            <div className="ticketGrid">
              <div>
                <small>Date</small>
                <strong>14 Aug 2026</strong>
              </div>

              <div>
                <small>Time</small>
                <strong>7:00–9:00 PM</strong>
              </div>

              <div>
                <small>Reservation</small>
                <strong>1 attendee</strong>
              </div>

              <div>
                <small>Total</small>
                <strong>$0.00</strong>
              </div>
            </div>

            <div className="ticketCode">
              <small>REGISTRATION CODE</small>
              <strong>{registration.code}</strong>
            </div>
          </div>

          <p className="smallPrint">
            Please save this registration code and present it at the entrance.
          </p>

          <div className="confirmationActions">
            <button
              className="primaryButton buttonReset"
              type="button"
              onClick={() => window.print()}
            >
              Print Confirmation
            </button>

            <Link className="secondaryButton" href="/">
              Return Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="registrationShell">
      <section className="registrationLayout">
        <aside className="registrationInfo">
          <Link className="backLink" href="/">
            ← Back to event
          </Link>

          <p className="sectionEyebrow gold">Free registration</p>

          <h1>Reserve a Spot</h1>

          <p>
            Each attendee must complete their own individual registration.
            One registration reserves one place only.
          </p>

          <div className="miniDetails">
            <div>
              <small>Date</small>
              <strong>Friday, 14 August 2026</strong>
            </div>

            <div>
              <small>Time</small>
              <strong>7:00 PM – 9:00 PM</strong>
            </div>

            <div>
              <small>Venue</small>
              <strong>Granville Community Centre</strong>
            </div>

            <div>
              <small>Price</small>
              <strong>Free individual registration</strong>
            </div>
          </div>
        </aside>

        <div className="formCard">
          <div className="formHeading">
            <p>Attendee details</p>
            <span>Live registration</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label>
              <span>Full name</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
              />
            </label>

            <label>
              <span>Email address</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={150}
              />
            </label>

            <label>
              <span>Mobile number</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="04XX XXX XXX"
                autoComplete="tel"
                maxLength={20}
              />
            </label>

            <div className="singleReservationNotice">
              <span>Reservation</span>
              <strong>1 attendee</strong>
              <p>Every attendee must complete their own registration.</p>
            </div>

            <input
              name="ticketQuantity"
              type="hidden"
              value="1"
            />

            <label className="honeypot" aria-hidden="true">
              Website
              <input
                name="website"
                value={form.website}
                onChange={updateField}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <label className="checkboxLabel">
              <input
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={updateField}
              />

              <span>
                I agree that the organiser may use these details for
                registration confirmation and important event updates.
              </span>
            </label>

            {error && (
              <div className="errorMessage" role="alert">
                {error}
              </div>
            )}

            <div className="orderSummary">
              <div>
                <span>Ticket price</span>
                <strong>$0.00</strong>
              </div>

              <div>
                <span>Reservation</span>
                <strong>1 attendee</strong>
              </div>

              <div className="orderTotal">
                <span>Total</span>
                <strong>$0.00</strong>
              </div>
            </div>

            <button
              className="submitButton"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Completing registration..."
                : "Complete Free Registration"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}