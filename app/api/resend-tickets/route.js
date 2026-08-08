import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendTicketEmail({
  email,
  fullName,
  registrationCode,
  qrToken,
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured.",
    );
  }

  const safeName = escapeHtml(
    fullName || "Guest",
  );

  const safeRegistrationCode =
    escapeHtml(registrationCode || "");

  const ticketUrl =
    `https://satchitananda.com.au/ticket/` +
    encodeURIComponent(qrToken);

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${resendApiKey}`,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        from:
          "Sat-Chit-Ānanda <tickets@mail.satchitananda.com.au>",

        to: [email],

        subject:
          "Your Sat-Chit-Ānanda QR Ticket",

        html: `
          <div
            style="
              font-family:Arial,sans-serif;
              max-width:620px;
              margin:0 auto;
              padding:36px 24px;
              color:#2f2925;
              background:#fffaf5;
            "
          >
            <div
              style="
                background:#ffffff;
                border-radius:18px;
                padding:36px;
                box-shadow:0 10px 30px rgba(0,0,0,0.08);
              "
            >

              <p
                style="
                  margin:0 0 10px;
                  color:#a06b3d;
                  font-size:13px;
                  font-weight:700;
                  letter-spacing:1.5px;
                  text-transform:uppercase;
                "
              >
                Sat-Chit-Ānanda
              </p>

              <h1
                style="
                  font-size:30px;
                  line-height:1.2;
                  margin:0 0 18px;
                  color:#2f2925;
                "
              >
                Your QR ticket is ready
              </h1>

              <p
                style="
                  font-size:17px;
                  line-height:1.7;
                  margin:0 0 18px;
                "
              >
                Namaste ${safeName},
              </p>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 18px;
                "
              >
                Your registration for
                Sat-Chit-Ānanda is confirmed.
              </p>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px;
                "
              >
                We are sending you your ticket
                link again so that you can
                access your personal QR ticket
                whenever you need it.
              </p>

              <div
                style="
                  margin:30px 0;
                  text-align:center;
                "
              >
                <a
                  href="${ticketUrl}"
                  style="
                    display:inline-block;
                    background:#7a3f2b;
                    color:#ffffff;
                    text-decoration:none;
                    padding:15px 28px;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:700;
                  "
                >
                  View My QR Ticket
                </a>
              </div>

              <div
                style="
                  background:#faf4ee;
                  border-radius:12px;
                  padding:20px;
                  margin:26px 0;
                "
              >
                <p
                  style="
                    margin:0 0 10px;
                    font-weight:700;
                    color:#3b332d;
                  "
                >
                  Event details
                </p>

                <p
                  style="
                    margin:6px 0;
                    font-size:15px;
                  "
                >
                  <strong>Date:</strong>
                  Friday, 14 August 2026
                </p>

                <p
                  style="
                    margin:6px 0;
                    font-size:15px;
                  "
                >
                  <strong>Time:</strong>
                  6:45 PM–9:00 PM
                </p>

                <p
                  style="
                    margin:6px 0;
                    font-size:15px;
                  "
                >
                  <strong>Venue:</strong>
                  The Granville Centre
                </p>

                <p
                  style="
                    margin:6px 0;
                    font-size:15px;
                  "
                >
                  <strong>Address:</strong>
                  1 Memorial Drive,
                  Granville NSW 2142
                </p>

                ${
                  safeRegistrationCode
                    ? `
                      <p
                        style="
                          margin:6px 0;
                          font-size:15px;
                        "
                      >
                        <strong>
                          Registration:
                        </strong>
                        ${safeRegistrationCode}
                      </p>
                    `
                    : ""
                }
              </div>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  margin:0 0 18px;
                "
              >
                Please keep this email.
                You can use the button above
                again whenever you need to
                display your ticket.
              </p>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  margin:0;
                "
              >
                With warmth,<br />
                <strong>
                  The Sat-Chit-Ānanda Team
                </strong>
              </p>

              <hr
                style="
                  margin:32px 0;
                  border:none;
                  border-top:1px solid #e6ddd5;
                "
              />

              <p
                style="
                  font-size:13px;
                  line-height:1.6;
                  color:#766c65;
                  margin:0 0 8px;
                "
              >
                If the button does not work,
                copy and paste this link into
                your browser:
              </p>

              <p
                style="
                  font-size:13px;
                  line-height:1.6;
                  word-break:break-all;
                  color:#7a3f2b;
                  margin:0;
                "
              >
                ${ticketUrl}
              </p>
            </div>
          </div>
        `,
      }),
    },
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Resend email error: ${errorText}`,
    );
  }

  return response.json();
}

function wait(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

export async function POST(request) {
  try {
    const body =
      await request.json().catch(() => ({}));

    const mode = body.mode || "test";
    const testEmail = body.testEmail;

    const supabase =
      createAdminClient();

    const {
      data: registrations,
      error,
    } = await supabase
      .from("registrations")
      .select(`
        id,
        registration_code,
        full_name,
        email,
        email_verified,
        qr_token
      `)
      .eq("status", "confirmed")
      .eq("email_verified", true)
      .not("qr_token", "is", null)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Ticket resend lookup error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Could not load verified registrations.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !registrations ||
      registrations.length === 0
    ) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message:
          "No verified registrations were found.",
      });
    }

    /*
      TEST MODE

      Sends one attendee's existing ticket
      to the email address supplied in
      testEmail.

      This lets us inspect the email before
      sending anything to all attendees.
    */
    if (mode === "test") {
      if (!testEmail) {
        return NextResponse.json(
          {
            error:
              "testEmail is required in test mode.",
          },
          {
            status: 400,
          },
        );
      }

      const registration =
        registrations[0];

      await sendTicketEmail({
        email: testEmail,
        fullName:
          registration.full_name,
        registrationCode:
          registration.registration_code,
        qrToken:
          registration.qr_token,
      });

      return NextResponse.json({
        success: true,
        mode: "test",
        sent: 1,
        sentTo: testEmail,
        message:
          "Test ticket email sent successfully.",
      });
    }

    /*
      ALL MODE

      Sends each already-verified attendee
      their EXISTING QR ticket.

      It does not change:
      - qr_token
      - registration
      - verification status
      - capacity
    */
    if (mode === "all") {
      const results = [];

      for (
        const registration
        of registrations
      ) {
        try {
          await sendTicketEmail({
            email:
              registration.email,
            fullName:
              registration.full_name,
            registrationCode:
              registration.registration_code,
            qrToken:
              registration.qr_token,
          });

          results.push({
            email:
              registration.email,
            success: true,
          });
        } catch (emailError) {
          console.error(
            `Ticket resend failed for ${registration.email}:`,
            emailError,
          );

          results.push({
            email:
              registration.email,
            success: false,
            error:
              emailError.message,
          });
        }

        /*
          Small delay so we do not fire all
          emails simultaneously.
        */
        await wait(600);
      }

      const successful =
        results.filter(
          (result) =>
            result.success,
        ).length;

      const failed =
        results.length - successful;

      return NextResponse.json({
        success:
          failed === 0,
        total:
          results.length,
        sent:
          successful,
        failed,
        results,
      });
    }

    return NextResponse.json(
      {
        error:
          'Invalid mode. Use "test" or "all".',
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Unexpected ticket resend error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred.",
      },
      {
        status: 500,
      },
    );
  }
}