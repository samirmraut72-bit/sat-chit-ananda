"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  ticketQuantity: "1",
  consent: false,
  website: "",
};

async function getAvailability() {
  const response = await fetch("/api/availability", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Availability could not be loaded.",
    );
  }

  return result;
}

function RegistrationTeamFooter() {
  return (
    <footer className="registrationTeamFooter">
      <div className="registrationTeamMember registrationVenue">
        <strong>Granville Community Centre</strong>

        <a
          href="https://www.google.com/maps/search/?api=1&query=1+Memorial+Drive+Granville+NSW+2142"
          target="_blank"
          rel="noopener noreferrer"
        >
          1 Memorial Drive, Granville NSW 2142
        </a>
      </div>

      <div className="registrationTeamMember">
        <strong>Bharat Poudel (Event Manager)</strong>

        <a href="tel:+61478930416">
          0478 930 416
        </a>
      </div>

      <div className="registrationTeamMember">
        <strong>Bijay Ghimire (NRNA)</strong>
        <span>NRNA NSW SCC Treasurer</span>

        <a href="tel:+61432801786">
          0432 801 786
        </a>
      </div>

      <div className="registrationTeamMember registrationAdminCredit">
        <strong>Admin Sameer Raut</strong>

        <a href="mailto:Samir.m.raut72@gmail.com">
          Samir.m.raut72@gmail.com
        </a>
      </div>
    </footer>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const result = await getAvailability();

        if (active) {
          setAvailability(result);
          setAvailabilityError("");
        }
      } catch (loadError) {
        console.error(
          "Availability loading error:",
          loadError,
        );

        if (active) {
          setAvailabilityError(
            "Live availability is temporarily unavailable.",
          );
        }
      }
    }

    loadAvailability();

    const interval = window.setInterval(
      loadAvailability,
      15000,
    );

    function refreshWhenFocused() {
      loadAvailability();
    }

    window.addEventListener(
      "focus",
      refreshWhenFocused,
    );

    return () => {
      active = false;

      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        refreshWhenFocused,
      );
    };
  }, []);

  const soldOut =
    availability?.soldOut === true ||
    availability?.registrationOpen === false ||
    availability?.available === 0;

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

    if (soldOut) {
      setError(
        "The event has reached its maximum capacity.",
      );

      return;
    }

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
          result.error ||
            "Registration could not be completed.",
        );
      }

      try {
        const latestAvailability =
          await getAvailability();

        setAvailability(latestAvailability);
      } catch (availabilityRefreshError) {
        console.error(
          "Availability refresh error:",
          availabilityRefreshError,
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
          <div className="successIcon">
            ✓
          </div>

          <p className="sectionEyebrow">
            Registration received
          </p>

          <h1>
            Thank you, {registration.fullName}
          </h1>

          <p className="confirmationLead">
            Your place at Sat-Chit-{"\u0100"}nanda has
            been reserved. Please check your email and
            verify your address to receive your QR ticket.
          </p>

          <div className="ticket">
            <div className="ticketTop">
              <div>
                <small>
                  EVENT
                </small>

                <strong>
                  Sat-Chit-{"\u0100"}nanda
                </strong>
              </div>

              <span className="freeBadge">
                FREE
              </span>
            </div>

            <div className="ticketGrid">
              <div>
                <small>
                  Date
                </small>

                <strong>
                  14 Aug 2026
                </strong>
              </div>

              <div>
                <small>
                  Time
                </small>

                <strong>
                  6:45–9:00 PM
                </strong>
              </div>

              <div>
                <small>
                  Reservation
                </small>

                <strong>
                  1 attendee
                </strong>
              </div>

              <div>
                <small>
                  Total
                </small>

                <strong>
                  $0.00
                </strong>
              </div>
            </div>

            <div className="ticketCode">
              <small>
                REGISTRATION CODE
              </small>

              <strong>
                {registration.code}
              </strong>
            </div>
          </div>

          <p className="smallPrint">
            Please check your inbox and verify your email
            address. Your QR ticket will be sent after
            verification.
          </p>

          <div className="confirmationActions">
            <button
              className="primaryButton buttonReset"
              type="button"
              onClick={() => window.print()}
            >
              Print Confirmation
            </button>

            <Link
              className="secondaryButton"
              href="/"
            >
              Return Home
            </Link>
          </div>
        </section>

        <RegistrationTeamFooter />
      </main>
    );
  }

  return (
    <main className="registrationShell">
      <section className="registrationLayout">
        <aside className="registrationInfo">
          <Link
            className="backLink"
            href="/"
          >
            ← Back to event
          </Link>

          <div className="registerCollaboration">
            <img
              src="/artists/NRNA.jpg"
              alt="NRNA logo"
              className="registerNrnaLogo"
            />

            <p>
              NRNA in collaboration with Project Beyond
            </p>
          </div>

          <p className="sectionEyebrow gold">
            Free registration
          </p>

          <h1>
            Reserve a Spot
          </h1>

          <p>
            Each attendee must complete their own
            individual registration. One registration
            reserves one place only.
          </p>

          <div
            className={
              soldOut
                ? "liveAvailability liveAvailabilitySoldOut"
                : "liveAvailability"
            }
          >
            <span className="availabilityPulse" />

            <div>
              <small>
                {soldOut
                  ? "Registration status"
                  : "Live availability"}
              </small>

              {availability ? (
                <strong>
                  {soldOut
                    ? "Sold out"
                    : `Available spots: ${availability.available}`}
                </strong>
              ) : (
                <strong>
                  Checking available spots...
                </strong>
              )}

              {availabilityError && (
                <p>
                  {availabilityError}
                </p>
              )}
            </div>
          </div>

          <div className="miniDetails">
            <div>
              <small>
                Date
              </small>

              <strong>
                Friday, 14 August 2026
              </strong>
            </div>

            <div>
              <small>
                Time
              </small>

              <strong>
                6:45 PM – 9:00 PM
              </strong>
            </div>

            <div>
              <small>
                Price
              </small>

              <strong>
                Free individual registration
              </strong>
            </div>
          </div>
        </aside>

        <div className="formCard">
          <div className="formHeading">
            <p>
              Attendee details
            </p>

            <span>
              {soldOut
                ? "Registration full"
                : "Live registration"}
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <label>
              <span>
                Full name
              </span>

              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                disabled={soldOut}
              />
            </label>

            <label>
              <span>
                Email address
              </span>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={150}
                disabled={soldOut}
              />
            </label>

            <label>
              <span>
                Mobile number
              </span>

              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="04XX XXX XXX"
                autoComplete="tel"
                maxLength={20}
                disabled={soldOut}
              />
            </label>

            <div className="singleReservationNotice">
              <span>
                Reservation
              </span>

              <strong>
                1 attendee
              </strong>

              <p>
                Every attendee must complete their own
                registration.
              </p>
            </div>

            <input
              name="ticketQuantity"
              type="hidden"
              value="1"
            />

            <label
              className="honeypot"
              aria-hidden="true"
            >
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
                disabled={soldOut}
              />

              <span>
                I agree that the organiser may use these
                details for registration confirmation and
                important event updates.
              </span>
            </label>

            {error && (
              <div
                className="errorMessage"
                role="alert"
              >
                {error}
              </div>
            )}

            {soldOut && (
              <div
                className="errorMessage"
                role="alert"
              >
                The event has reached its maximum capacity
                of 150 attendees.
              </div>
            )}

            <div className="orderSummary">
              <div>
                <span>
                  Ticket price
                </span>

                <strong>
                  $0.00
                </strong>
              </div>

              <div>
                <span>
                  Reservation
                </span>

                <strong>
                  1 attendee
                </strong>
              </div>

              <div className="orderTotal">
                <span>
                  Total
                </span>

                <strong>
                  $0.00
                </strong>
              </div>
            </div>

            <button
              className="submitButton"
              type="submit"
              disabled={submitting || soldOut}
            >
              {soldOut
                ? "Event Sold Out"
                : submitting
                  ? "Completing registration..."
                  : "Complete Free Registration"}
            </button>
          </form>
        </div>
      </section>

      <RegistrationTeamFooter />
    </main>
  );
}