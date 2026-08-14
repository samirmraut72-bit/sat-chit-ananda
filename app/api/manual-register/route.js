import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_SLUG = "sat-chit-ananda-2026";

const FROM_EMAIL =
  "Sat-Chit-Ānanda <tickets@mail.satchitananda.com.au>";

/*
  Midnight at the end of event day:
  15 Aug 2026 12:00 AM Sydney
  = 14 Aug 2026 14:00 UTC
*/
const VERIFICATION_EXPIRES_AT =
  "2026-08-14T14:00:00.000Z";

function makeRegistrationCode() {
  return `SCA-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function makeVerificationToken() {
  return randomUUID().replaceAll("-", "");
}

/*
  The database requires a phone value,
  but manual guests do not need to provide one.

  We create a unique INTERNAL placeholder so
  there is no duplicate-phone conflict.
*/
function makeManualPhone() {
  return `MANUAL-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendVerificationEmail({
  email,
  fullName,
  verificationUrl,
  registrationCode,
}) {
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const safeName =
    escapeHtml(fullName);

  const safeCode =
    escapeHtml(registrationCode);

  const response =
    await fetch(
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
          from: FROM_EMAIL,

          to: [
            email,
          ],

          subject:
            "A warm welcome to Sat-Chit-Ānanda",

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
                  Thank you for registering
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
                  We are delighted to warmly welcome
                  you to Sat-Chit-Ānanda.
                </p>

                <p
                  style="
                    font-size:16px;
                    line-height:1.7;
                    margin:0 0 24px;
                  "
                >
                  Your registration has been received.
                  Please verify your email address using
                  the button below to confirm your place
                  and receive your personal QR ticket.
                </p>

                <div
                  style="
                    margin:30px 0;
                    text-align:center;
                  "
                >
                  <a
                    href="${verificationUrl}"
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
                    Verify email and receive QR ticket
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
                    <strong>
                      Registration code:
                    </strong>
                    ${safeCode}
                  </p>
                </div>

                <p
                  style="
                    font-size:15px;
                    line-height:1.7;
                    margin:0 0 18px;
                  "
                >
                  We look forward to welcoming you.
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
                  Please verify your registration
                  before midnight tonight.
                </p>

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
                  ${verificationUrl}
                </p>

              </div>
            </div>
          `,
        }),
      }
    );

  if (!response.ok) {
    const resendError =
      await response.text();

    throw new Error(
      `Resend email error: ${resendError}`
    );
  }

  return response.json();
}

export async function POST(request) {
  let registrationCode = null;

  try {
    /*
      Protect this manual route.
      We use the same BULK_EMAIL_SECRET
      already stored in Vercel.
    */
    const expectedSecret =
      process.env.BULK_EMAIL_SECRET;

    const suppliedSecret =
      request.headers.get(
        "x-bulk-email-secret"
      );

    if (
      !expectedSecret ||
      suppliedSecret !== expectedSecret
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const fullName =
      String(
        body?.fullName || ""
      ).trim();

    const email =
      String(
        body?.email || ""
      )
        .trim()
        .toLowerCase();

    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid full name.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidEmail(email) ||
      email.length > 150
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createAdminClient();

    /*
      Check email first so we don't accidentally
      create a duplicate registration.
    */
    const {
      data: existing,
      error: existingError,
    } =
      await supabase
        .from("registrations")
        .select(`
          id,
          registration_code,
          full_name,
          email,
          status,
          email_verified,
          qr_token,
          verification_token
        `)
        .ilike(
          "email",
          email
        )
        .maybeSingle();

    if (existingError) {
      console.error(
        "Manual duplicate check failed:",
        existingError
      );

      return NextResponse.json(
        {
          error:
            "Could not check existing registrations.",
        },
        {
          status: 500,
        }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error:
            "This email address is already registered.",

          alreadyRegistered:
            true,

          registration: {
            code:
              existing.registration_code,

            fullName:
              existing.full_name,

            email:
              existing.email,

            verified:
              existing.email_verified === true,
          },
        },
        {
          status: 409,
        }
      );
    }

    registrationCode =
      makeRegistrationCode();

    const verificationToken =
      makeVerificationToken();

    const manualPhone =
      makeManualPhone();

    /*
      Use the SAME database registration RPC
      as normal registrations.

      The generated MANUAL-... value satisfies
      the NOT NULL phone requirement while
      clearly showing this attendee did not
      provide a phone number.
    */
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "register_for_event",
        {
          p_event_slug:
            EVENT_SLUG,

          p_registration_code:
            registrationCode,

          p_full_name:
            fullName,

          p_email:
            email,

          p_phone:
            manualPhone,

          p_ticket_quantity:
            1,
        }
      );

    if (error) {
      console.error(
        "Manual registration database error:",
        error
      );

      if (
        error.code === "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "This attendee appears to already be registered.",
          },
          {
            status: 409,
          }
        );
      }

      if (
        error.message?.includes(
          "CAPACITY_EXCEEDED"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "The event has reached its maximum capacity.",
          },
          {
            status: 409,
          }
        );
      }

      if (
        error.message?.includes(
          "REGISTRATION_CLOSED"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Registration is currently closed.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Manual registration could not be completed.",
        },
        {
          status: 500,
        }
      );
    }

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    /*
      Prepare email verification.
    */
    const {
      error: tokenError,
    } =
      await supabase
        .from("registrations")
        .update({
          email_verified:
            false,

          verification_token:
            verificationToken,

          verification_expires_at:
            VERIFICATION_EXPIRES_AT,

          qr_token:
            null,
        })
        .eq(
          "registration_code",
          registrationCode
        );

    if (tokenError) {
      console.error(
        "Manual token update failed:",
        tokenError
      );

      /*
        Remove incomplete registration rather
        than leave a broken attendee record.
      */
      await supabase
        .from("registrations")
        .delete()
        .eq(
          "registration_code",
          registrationCode
        );

      return NextResponse.json(
        {
          error:
            "Registration could not be prepared for email verification.",
        },
        {
          status: 500,
        }
      );
    }

    const verificationUrl =
      `https://satchitananda.com.au/api/verify-email?token=` +
      encodeURIComponent(
        verificationToken
      );

    /*
      Send verification email.
    */
    try {
      await sendVerificationEmail({
        email,
        fullName,
        verificationUrl,
        registrationCode,
      });
    } catch (emailError) {
      console.error(
        "Manual verification email failed:",
        emailError
      );

      /*
        Match normal registration behaviour:
        remove registration if the initial
        verification email could not be accepted.
      */
      await supabase
        .from("registrations")
        .delete()
        .eq(
          "registration_code",
          registrationCode
        );

      return NextResponse.json(
        {
          error:
            "Registration was prepared, but the verification email could not be sent. The registration has been removed so you can correct the address and try again.",

          emailSendFailed:
            true,
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success:
        true,

      manualRegistration:
        true,

      verificationPending:
        true,

      registration: {
        code:
          result?.registration_code ||
          registrationCode,

        fullName:
          result?.full_name ||
          fullName,

        email:
          email,

        ticketQuantity:
          1,
      },

      message:
        "Manual registration completed and verification email sent.",
    });

  } catch (error) {
    console.error(
      "Unexpected manual registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected manual registration error.",
      },
      {
        status: 500,
      }
    );
  }
}