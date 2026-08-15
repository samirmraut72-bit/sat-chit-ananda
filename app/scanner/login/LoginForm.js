"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ScannerLoginForm({
  unauthorized,
  signedOut,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    unauthorized
      ? "This account does not have scanner permission."
      : "",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!unauthorized) return;

    const supabase = createClient();
    supabase.auth.signOut();
  }, [unauthorized]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (signInError) {
      setError("The email or password is incorrect.");
      setSubmitting(false);
      return;
    }

    window.location.assign("/scanner");
  }

  return (
    <main className="adminLoginShell">
      <section className="adminLoginCard">
        <Link className="loginBackLink" href="/">
          ← Return to event website
        </Link>

        <div className="adminSeal">◉</div>

        <p className="sectionEyebrow">
          Event entry team
        </p>

        <h1>Volunteer Scanner</h1>

        <p className="loginIntro">
          Sign in with your assigned volunteer account
          to scan attendee QR tickets.
        </p>

        {signedOut && (
          <div className="successNotice">
            You have been signed out safely.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            <span>Volunteer email</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="scanner01@satchitananda.com.au"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div
              className="errorMessage"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            className="submitButton"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Open Scanner"}
          </button>
        </form>

        <p className="adminLoginNote">
          Scanner accounts can check guests in but
          cannot access the organiser dashboard.
        </p>
      </section>
    </main>
  );
}