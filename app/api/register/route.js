import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  getEmailSuggestion,
  isValidAustralianMobile,
  isValidEmailFormat,
  normalizeAustralianMobile,
  normalizeEmail,
} from "@/lib/validation/contact";

const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: z
    .string()
    .trim()
    .max(150),

  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[+()\-\s0-9]+$/),

  ticketQuantity: z.coerce
    .number()
    .int()
    .min(1)
    .max(1),

  consent: z.literal(true),

  website: z
    .string()
    .max(0)
    .optional()
    .default(""),
});

function makeRegistrationCode() {
  return `SCA-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function makeVerificationToken() {
  return randomUUID().replaceAll("-", "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendVerificationEmail({
  email,
  fullName,
  verificationUrl,
}) {
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured.",
    );
  }

  const safeName =
    escapeHtml(fullName);

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
                you to Sat-Chit-Ānanda, an intimate
                evening of kirtan, music, devotion
                and community.
              </p>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px;
                "
              >
                Your registration has been
                received. Please verify your email
                address using the button below to
                confirm your place and receive your
                personal QR ticket.
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

                <p style="margin:6px 0;font-size:15px;">
                  <strong>Date:</strong>
                  Friday, 14 August 2026
                </p>

                <p style="margin:6px 0;font-size:15px;">
                  <strong>Time:</strong>
                  6:45 PM–9:00 PM
                </p>

                <p style="margin:6px 0;font-size:15px;">
                  <strong>Venue:</strong>
                  The Granville Centre
                </p>

                <p style="margin:6px 0;font-size:15px;">
                  <strong>Address:</strong>
                  1 Memorial Drive,
                  Granville NSW 2142
                </p>
              </div>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  margin:0 0 18px;
                "
              >
                We look forward to sharing this
                beautiful gathering with you.
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
                This ticket link can be used
                multiple times and will expire
                at 12:00 AM on 15 August 2026.
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
    },
  );

  if (!response.ok) {
    const resendError =
      await response.text();

    throw new Error(
      `Resend email error: ${resendError}`,
    );
  }

  return response.json();
}

export async function POST(request) {
  try {
    const body =
      await request.json();

    /*
      First layer of server validation.
      This protects the API even if someone
      bypasses the browser registration form.
    */
    const parsed =
      registrationSchema.safeParse({
        ...body,
        ticketQuantity: 1,
      });

    if (!parsed.success) {
      const issue =
        parsed.error.issues[0];

      const friendlyMessages = {
        fullName:
          "Please enter your full name.",

        email:
          "Please enter a valid email address.",

        phone:
          "Please enter a valid Australian mobile number.",

        ticketQuantity:
          "Only one place can be reserved per registration.",

        consent:
          "Please accept the registration agreement.",
      };

      const field =
        issue?.path?.[0];

      return NextResponse.json(
        {
          error:
            friendlyMessages[field] ||
            "Please check the information and try again.",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Honeypot protection.

      Real users never fill this field.
      Basic bots often do.
    */
    if (parsed.data.website) {
      return NextResponse.json({
        success: true,
        verificationPending: true,
      });
    }

    /*
      Normalize the values BEFORE storing them.

      Email:
      Sameer@GMAIL.COM
      becomes
      sameer@gmail.com

      Phone:
      +61 412 345 678
      becomes
      0412345678
    */
    const email =
      normalizeEmail(
        parsed.data.email,
      );

    const phone =
      normalizeAustralianMobile(
        parsed.data.phone,
      );

    /*
      Strict server-side email validation.
    */
    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Catch common email-domain typing mistakes.

      Examples:
      gmail.con
      gmqil.com
      yahoo.con
    */
    const emailSuggestion =
      getEmailSuggestion(email);

    if (emailSuggestion) {
      return NextResponse.json(
        {
          error:
            `Please check your email address. Did you mean ${emailSuggestion}?`,
        },
        {
          status: 400,
        },
      );
    }

    /*
      Australian mobile validation.

      Valid examples:

      0412 345 678
      0412345678
      +61 412 345 678

      Stored format:

      0412345678
    */
    if (
      !isValidAustralianMobile(
        phone,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Australian mobile number, for example 0412 345 678.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      createAdminClient();

    const registrationCode =
      makeRegistrationCode();

    const verificationToken =
      makeVerificationToken();

    /*
      CURRENT EVENT LOGIC

      We are keeping your existing verification
      behaviour for now.

      In the next QR upgrade we will remove this
      hard-coded event expiry and move QR validity
      into proper event settings.
    */
    const verificationExpiresAt =
      new Date(
        "2026-08-15T00:00:00+10:00",
      ).toISOString();

    /*
      Create the registration through your
      existing database function.
    */
    const { data, error } =
      await supabase.rpc(
        "register_for_event",
        {
          p_event_slug:
            "sat-chit-ananda-2026",

          p_registration_code:
            registrationCode,

          p_full_name:
            parsed.data.fullName,

          p_email:
            email,

          p_phone:
            phone,

          p_ticket_quantity:
            1,
        },
      );

    if (error) {
      console.error(
        "Registration database error:",
        error,
      );

      /*
        Duplicate email or phone.
      */
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This email address or mobile number has already been registered.",
          },
          {
            status: 409,
          },
        );
      }

      /*
        Database only allows one attendee
        per registration.
      */
      if (
        error.message.includes(
          "ONE_RESERVATION_ONLY",
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Only one place can be reserved per registration.",
          },
          {
            status: 400,
          },
        );
      }

      /*
        Event capacity protection.
      */
      if (
        error.message.includes(
          "CAPACITY_EXCEEDED",
        )
      ) {
        return NextResponse.json(
          {
            error:
              "The event has reached its maximum capacity.",
          },
          {
            status: 409,
          },
        );
      }

      /*
        Registration-open protection.
      */
      if (
        error.message.includes(
          "REGISTRATION_CLOSED",
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Registration is currently closed.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json(
        {
          error:
            "Registration could not be completed. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    /*
      CURRENT QR / EMAIL VERIFICATION SYSTEM

      At the moment QR is still NULL until
      email verification.

      We are deliberately leaving this untouched
      in this step.

      In our QR upgrade we will change this so
      a QR token is created immediately when
      registration succeeds.
    */
    const { error: tokenError } =
      await supabase
        .from("registrations")
        .update({
          email_verified: false,

          verification_token:
            verificationToken,

          verification_expires_at:
            verificationExpiresAt,

          qr_token: null,
        })
        .eq(
          "registration_code",
          registrationCode,
        );

    if (tokenError) {
      console.error(
        "Verification token database error:",
        tokenError,
      );

      /*
        Roll back registration if preparation
        failed.
      */
      await supabase
        .from("registrations")
        .delete()
        .eq(
          "registration_code",
          registrationCode,
        );

      return NextResponse.json(
        {
          error:
            "Registration could not be prepared for verification.",
        },
        {
          status: 500,
        },
      );
    }

    const verificationUrl =
      `https://satchitananda.com.au/api/verify-email?token=` +
      encodeURIComponent(
        verificationToken,
      );

    try {
      await sendVerificationEmail({
        email,

        fullName:
          parsed.data.fullName,

        verificationUrl,
      });
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError,
      );

      /*
        Your current system deletes the
        registration when the verification
        email cannot be sent.

        We will reconsider this when we build
        the new QR/email delivery architecture.
      */
      await supabase
        .from("registrations")
        .delete()
        .eq(
          "registration_code",
          registrationCode,
        );

      return NextResponse.json(
        {
          error:
            "We could not send the verification email. Please check your email address and try again.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      verificationPending: true,

      registration: {
        code:
          result.registration_code,

        fullName:
          result.full_name,

        ticketQuantity:
          1,
      },

      message:
        "Thank you for registering. Please check your email and verify your address to receive your QR ticket.",
    });
  } catch (error) {
    console.error(
      "Unexpected registration error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}