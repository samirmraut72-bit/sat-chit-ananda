"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ unauthorized, signedOut }) {
  const [email, setEmail] = useState("Samir.m.raut72@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    unauthorized
      ? "This account is signed in but does not have administrator permission."
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
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("The email or password is incorrect.");
      setSubmitting(false);
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <main className="adminLoginShell">
      <section className="adminLoginCard">
        <Link className="loginBackLink" href="/">
          ← Return to event website
        </Link>

        <div className="adminSeal">ॐ</div>
        <p className="sectionEyebrow">Organiser access</p>
        <h1>Admin login</h1>
        <p className="loginIntro">
          Sign in to view registrations, manage check-in and export the
          attendee list.
        </p>

        {signedOut && (
          <div className="successNotice">You have been signed out safely.</div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="errorMessage" role="alert">
              {error}
            </div>
          )}

          <button
            className="submitButton"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        <p className="adminLoginNote">
          Public visitors cannot create admin accounts. Organisers must be
          approved in Supabase.
        </p>
      </section>
    </main>
  );
}
