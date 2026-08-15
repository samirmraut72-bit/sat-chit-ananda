"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  formatAustralianMobile,
  getEmailSuggestion,
  normalizeAustralianMobile,
  normalizeEmail,
  validateContactDetails,
} from "@/lib/validation/contact";

const initialForm = {
  fullName: "",
  email: "",
  confirmEmail: "",
  phone: "",
  confirmPhone: "",
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
        <strong>The Granville Centre</strong>

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [registration, setRegistration] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] =
    useState("");

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

  const emailSuggestion =
    getEmailSuggestion(form.email);

  const emailsMatch =
    form.email &&
    form.confirmEmail &&
    normalizeEmail(form.email) ===
      normalizeEmail(form.confirmEmail);

  const phonesMatch =
    form.phone &&
    form.confirmPhone &&
    normalizeAustralianMobile(form.phone) ===
      normalizeAustralianMobile(form.confirmPhone);

  function updateField(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handlePhoneBlur(fieldName) {
    setForm((current) => ({
      ...current,
      [fieldName]:
        formatAustralianMobile(
          current[fieldName],
        ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (soldOut) {
      setError(
        "The event is now closed.",
      );

      return;
    }

    if (!form.fullName.trim()) {
      setFieldErrors({
        fullName:
          "Please enter your full name.",
      });

      return;
    }

    if (form.fullName.trim().length < 2) {
      setFieldErrors({
        fullName:
          "Please enter your full name.",
      });

      return;
    }

    const contactValidation =
      validateContactDetails({
        email: form.email,
        confirmEmail: form.confirmEmail,
        phone: form.phone,
        confirmPhone: form.confirmPhone,
      });

    if (!contactValidation.valid) {
      setFieldErrors({
        [contactValidation.field]:
          contactValidation.error,
      });

      return;
    }

    if (!form.consent) {
      setFieldErrors({
        consent:
          "Please confirm that you agree to receive registration and important event updates.",
      });

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName:
              form.fullName.trim(),

            email:
              contactValidation.email,

            phone:
              contactValidation.phone,

            ticketQuantity: "1",

            consent:
              form.consent,

            website:
              form.website,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Registration could not be completed.",
        );
      }

      try {
        const latestAvailability =
          await getAvailability();

        setAvailability(
          latestAvailability,
        );
      } catch (
        availabilityRefreshError
      ) {
        console.error(
          "Availability refresh error:",
          availabilityRefreshError,
        );
      }

      setRegistration(
        result.registration,
      );

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
            Thank you,{" "}
            {registration.fullName}
          </h1>

          <p className="confirmationLead">
            Your place at
            Sat-Chit-{"\u0100"}nanda
            has been reserved.
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
            Please keep your confirmation
            details safe.
          </p>

          <div className="confirmationActions">
            <button
              className="primaryButton buttonReset"
              type="button"
              onClick={() =>
                window.print()
              }
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
              NRNA in collaboration with
              Project Beyond
            </p>
          </div>

          <p className="sectionEyebrow gold">
            Sat-Chit-Ānanda
          </p>

          <h1>
            {soldOut
              ? "Event Closed"
              : "Reserve a Spot"}
          </h1>

          <p>
            {soldOut
              ? "Thank you for sharing this gathering with us. Stay connected with Project Beyond for what comes next."
              : "Please enter your contact details carefully. We use your email and mobile number for your registration and important event information."}
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
                  ? "Sat-Chit-Ānanda"
                  : "Live availability"}
              </small>

              {availability ? (
                soldOut ? (
                  <>
                    <strong>
                      Thank you for being
                      part of this beautiful
                      gathering.
                    </strong>

                    <p
                      style={{
                        margin:
                          "8px 0 0",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        opacity: 0.85,
                      }}
                    >
                      Stay connected with
                      us for the next
                      journey. ✨
                    </p>
                  </>
                ) : (
                  <strong>
                    Available spots:{" "}
                    {
                      availability.available
                    }
                  </strong>
                )
              ) : (
                <strong>
                  Checking available
                  spots...
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
                Free individual
                registration
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
                ? "Event Closed"
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

              {fieldErrors.fullName && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#ff9d9d",
                  }}
                >
                  {
                    fieldErrors.fullName
                  }
                </small>
              )}
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

              {emailSuggestion && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#f1b24a",
                  }}
                >
                  Did you mean{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,
                          email:
                            emailSuggestion,
                        }),
                      )
                    }
                    style={{
                      padding: 0,
                      border: 0,
                      background:
                        "transparent",
                      color: "inherit",
                      font: "inherit",
                      textDecoration:
                        "underline",
                      cursor: "pointer",
                    }}
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </small>
              )}

              {fieldErrors.email && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#ff9d9d",
                  }}
                >
                  {fieldErrors.email}
                </small>
              )}
            </label>

            <label>
              <span>
                Confirm email address
              </span>

              <input
                name="confirmEmail"
                type="email"
                value={
                  form.confirmEmail
                }
                onChange={updateField}
                placeholder="Enter your email again"
                autoComplete="off"
                maxLength={150}
                disabled={soldOut}
              />

              {form.confirmEmail &&
                emailsMatch && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#8fd694",
                    }}
                  >
                    ✓ Email addresses
                    match
                  </small>
                )}

              {fieldErrors.confirmEmail && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#ff9d9d",
                  }}
                >
                  {
                    fieldErrors.confirmEmail
                  }
                </small>
              )}
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
                onBlur={() =>
                  handlePhoneBlur(
                    "phone",
                  )
                }
                placeholder="0412 345 678"
                autoComplete="tel"
                maxLength={20}
                disabled={soldOut}
              />

              {fieldErrors.phone && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#ff9d9d",
                  }}
                >
                  {fieldErrors.phone}
                </small>
              )}
            </label>

            <label>
              <span>
                Confirm mobile number
              </span>

              <input
                name="confirmPhone"
                type="tel"
                value={
                  form.confirmPhone
                }
                onChange={updateField}
                onBlur={() =>
                  handlePhoneBlur(
                    "confirmPhone",
                  )
                }
                placeholder="Enter your mobile again"
                autoComplete="off"
                maxLength={20}
                disabled={soldOut}
              />

              {form.confirmPhone &&
                phonesMatch && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#8fd694",
                    }}
                  >
                    ✓ Mobile numbers
                    match
                  </small>
                )}

              {fieldErrors.confirmPhone && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#ff9d9d",
                  }}
                >
                  {
                    fieldErrors.confirmPhone
                  }
                </small>
              )}
            </label>

            <div className="singleReservationNotice">
              <span>
                Reservation
              </span>

              <strong>
                1 attendee
              </strong>

              <p>
                Every attendee must complete
                their own registration.
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
                I agree that the organiser
                may use these details for
                registration confirmation
                and important event updates.
              </span>
            </label>

            {fieldErrors.consent && (
              <small
                style={{
                  display: "block",
                  marginTop: "-10px",
                  marginBottom: "16px",
                  color: "#ff9d9d",
                }}
              >
                {fieldErrors.consent}
              </small>
            )}

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
                role="status"
              >
                Thank you for being part of
                this beautiful gathering.
                Stay connected with us for
                the next journey. ✨
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
              disabled={
                submitting || soldOut
              }
            >
              {soldOut
                ? "Event Closed"
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