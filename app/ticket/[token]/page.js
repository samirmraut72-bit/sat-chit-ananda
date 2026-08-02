import QRCode from "qrcode";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data: registration, error } = await supabase
    .from("registrations")
    .select(`
      registration_code,
      full_name,
      email,
      phone,
      email_verified,
      qr_token
    `)
    .eq("qr_token", token)
    .maybeSingle();

  if (
    error ||
    !registration ||
    !registration.email_verified ||
    !registration.qr_token
  ) {
    notFound();
  }

  const ticketUrl = `https://satchitananda.com.au/ticket/${registration.qr_token}`;

  const qrCode = await QRCode.toDataURL(ticketUrl, {
    width: 320,
    margin: 2,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5efe8",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "620px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
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
          EMAIL VERIFIED
        </p>

        <h1
          style={{
            fontSize: "36px",
            margin: "14px 0 8px",
            color: "#29231f",
          }}
        >
          Sat-Chit-Ānanda
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#625851",
            marginBottom: "28px",
          }}
        >
          Your place is confirmed.
        </p>

        <img
          src={qrCode}
          alt="Sat-Chit-Ānanda QR ticket"
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
            <strong>Name:</strong> {registration.full_name}
          </p>

          <p>
            <strong>Registration code:</strong>{" "}
            {registration.registration_code}
          </p>

          <p>
            <strong>Date:</strong> Friday, 14 August 2026
          </p>

          <p>
            <strong>Time:</strong> 6:45 PM–9:00 PM
          </p>

          <p>
            <strong>Venue:</strong> Granville Community Centre
          </p>
        </div>

        <p
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "#746a63",
          }}
        >
          Please show this QR ticket at the entrance.
        </p>

        <a
          href="https://satchitananda.com.au"
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