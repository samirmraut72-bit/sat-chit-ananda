"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Password changed successfully. You can now sign in with your new password."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      console.error(
        "Password update error:",
        updateError
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update the password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: "18px",
          padding: "32px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#d5aa72",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "1.5px",
          }}
        >
          SAT-CHIT-ĀNANDA ADMIN
        </p>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "30px",
          }}
        >
          Set New Password
        </h1>

        <p
          style={{
            color: "#b8b8b8",
            lineHeight: "1.6",
            marginBottom: "28px",
          }}
        >
          Enter your new administrator password below.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
              }}
            >
              New password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="Enter new password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #3a3a3a",
                background: "#050505",
                color: "#ffffff",
                fontSize: "16px",
              }}
            />
          </label>

          <label
            style={{
              display: "block",
              marginBottom: "22px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
              }}
            >
              Confirm new password
            </span>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              placeholder="Enter password again"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #3a3a3a",
                background: "#050505",
                color: "#ffffff",
                fontSize: "16px",
              }}
            />
          </label>

          {error ? (
            <div
              style={{
                marginBottom: "18px",
                padding: "13px",
                borderRadius: "9px",
                background: "#2b0d0d",
                border: "1px solid #8c3030",
                color: "#ffaaaa",
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                marginBottom: "18px",
                padding: "13px",
                borderRadius: "9px",
                background: "#0d2817",
                border: "1px solid #286f42",
                color: "#9effb9",
              }}
            >
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "800",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              background: "#ffffff",
              color: "#050505",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Updating password..."
              : "Change Password"}
          </button>
        </form>

        {message ? (
          <a
            href="/admin"
            style={{
              display: "block",
              marginTop: "22px",
              textAlign: "center",
              color: "#d5aa72",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            Go to Admin Login →
          </a>
        ) : null}
      </section>
    </main>
  );
}