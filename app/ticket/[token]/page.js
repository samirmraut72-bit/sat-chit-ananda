import QRCode from "qrcode";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const supabase =
    createAdminClient();

  const {
    data: registration,
    error,
  } = await supabase
    .from("registrations")
    .select(`
      registration_code,
      full_name,
      email,
      phone,
      status,
      checked_in,
      email_verified,
      qr_token
    `)
    .eq(
      "qr_token",
      token,
    )
    .maybeSingle();

  /*
    A ticket is valid when:
    - the QR token exists
    - the registration exists
    - the registration is confirmed

    Email verification is NOT required.
  */
  if (
    error ||
    !registration ||
    !registration.qr_token ||
    registration.status !== "confirmed"
  ) {
    notFound();
  }

  /*
    Use the current website origin.

    Local:
    http://localhost:3000

    Production:
    https://satchitananda.com.au
  */
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const ticketUrl =
    `${baseUrl}/ticket/` +
    encodeURIComponent(
      registration.qr_token,
    );

  const qrCode =
    await QRCode.toDataURL(
      ticketUrl,
      {
        width: 320,
        margin: 2,
      },
    );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5efe8",
        padding: "40px 20px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "620px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "36px",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.10)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#7a3f2b",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          REGISTRATION CONFIRMED
        </p>

        <h1
          style={{
            fontSize: "36px",
            margin: "14px 0 8px",
            color: "#29231f",
          }}
        >
          Sat-Chit-{"\u0100"}nanda
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#625851",
            marginBottom: "28px",
          }}
        >
          Your QR ticket is ready.
        </p>

        <img
          src={qrCode}
          alt="Sat-Chit-Ananda QR ticket"
          width="320"
          height="320"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "12px",
          }}
        />

        <div
          style={{
            marginTop: "28px",
            padding: "22px",
            background: "#faf7f3",
            borderRadius: "12px",
            textAlign: "left",
          }}
        >
          <p>
            <strong>Name:</strong>{" "}
            {registration.full_name}
          </p>

          <p>
            <strong>
              Registration code:
            </strong>{" "}
            {
              registration.registration_code
            }
          </p>

          <p>
            <strong>
              Email status:
            </strong>{" "}
            {registration.email_verified
              ? "Verified"
              : "Not yet verified"}
          </p>

          <p>
            <strong>
              Check-in status:
            </strong>{" "}
            {registration.checked_in
              ? "Checked in"
              : "Not checked in"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            Friday, 14 August 2026
          </p>

          <p>
            <strong>Time:</strong>{" "}
            6:45 PM–9:00 PM
          </p>

          <p>
            <strong>Venue:</strong>{" "}
            The Granville Centre
          </p>

          <p>
            <strong>Address:</strong>{" "}
            1 Memorial Drive,
            Granville NSW 2142
          </p>
        </div>

        <p
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "#746a63",
          }}
        >
          Please show this QR ticket
          at the entrance.
        </p>

        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#8a817b",
          }}
        >
          Email verification does not affect
          access to this QR ticket.
        </p>

        <a
          href={baseUrl}
          style={{
            display: "inline-block",
            marginTop: "18px",
            color: "#7a3f2b",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          ← Back to website
        </a>
      </div>
    </main>
  );
}