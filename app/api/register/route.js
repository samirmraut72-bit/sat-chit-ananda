import {
  randomUUID,
} from "crypto";

import QRCode from "qrcode";
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

const EVENT_SLUG =
  "sat-chit-ananda-2026";

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
    .max(30),

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

function makeQrToken() {
  return randomUUID().replaceAll(
    "-",
    "",
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function makeQrPngBase64(
  ticketUrl,
) {
  const qrBuffer =
    await QRCode.toBuffer(
      ticketUrl,
      {
        type: "png",
        width: 420,
        margin: 2,
        errorCorrectionLevel:
          "M",
      },
    );

  return qrBuffer.toString(
    "base64",
  );
}

async function sendRegistrationEmail({
  email,
  fullName,
  registrationCode,
  ticketUrl,
  qrBase64,
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

  const safeRegistrationCode =
    escapeHtml(
      registrationCode,
    );

  const safeTicketUrl =
    escapeHtml(ticketUrl);

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

        text: `
Namaste ${fullName},

Your registration for Sat-Chit-Ānanda is confirmed.

Registration code:
${registrationCode}

Please present your QR ticket at the entrance.

You can also open your ticket here:
${ticketUrl}

Friday, 14 August 2026
6:45 PM–9:00 PM
The Granville Centre
1 Memorial Drive, Granville NSW 2142

Sat-Chit-Ānanda
Project Beyond
        `.trim(),

        html: `
          <div
            style="
              margin:0;
              padding:32px 16px;
              background:#f5efe8;
              font-family:Arial,sans-serif;
              color:#29231f;
            "
          >
            <div
              style="
                max-width:620px;
                margin:0 auto;
                background:#ffffff;
                border-radius:18px;
                padding:36px;
                box-shadow:0 10px 30px rgba(0,0,0,0.08);
              "
            >
              <p
                style="
                  margin:0 0 10px;
                  color:#7a3f2b;
                  font-size:13px;
                  font-weight:700;
                  letter-spacing:1.4px;
                  text-transform:uppercase;
                "
              >
                Sat-Chit-Ānanda
              </p>

              <h1
                style="
                  margin:0 0 18px;
                  font-size:30px;
                  line-height:1.2;
                "
              >
                Your QR ticket is ready
              </h1>

              <p
                style="
                  margin:0 0 18px;
                  font-size:17px;
                  line-height:1.7;
                "
              >
                Namaste ${safeName},
              </p>

              <p
                style="
                  margin:0 0 20px;
                  font-size:16px;
                  line-height:1.7;
                "
              >
                Your registration is confirmed.
                Please present the QR code below
                when you arrive at the venue.
              </p>

              <div
                style="
                  margin:28px 0;
                  padding:24px;
                  background:#faf7f3;
                  border-radius:16px;
                  text-align:center;
                "
              >
                <img
                  src="cid:sat-chit-ananda-ticket-qr"
                  alt="Sat-Chit-Ananda QR ticket"
                  width="320"
                  height="320"
                  style="
                    display:block;
                    width:100%;
                    max-width:320px;
                    height:auto;
                    margin:0 auto;
                    background:#ffffff;
                    border-radius:12px;
                  "
                />

                <p
                  style="
                    margin:18px 0 0;
                    font-size:14px;
                    color:#625851;
                    line-height:1.6;
                  "
                >
                  Show this QR code to event staff
                  at the entrance.
                </p>
              </div>

              <div
                style="
                  margin:26px 0;
                  padding:20px;
                  background:#faf7f3;
                  border-radius:12px;
                "
              >
                <p style="margin:0 0 8px;">
                  <strong>
                    Registration code:
                  </strong>
                  ${safeRegistrationCode}
                </p>

                <p style="margin:8px 0;">
                  <strong>Date:</strong>
                  Friday, 14 August 2026
                </p>

                <p style="margin:8px 0;">
                  <strong>Time:</strong>
                  6:45 PM–9:00 PM
                </p>

                <p style="margin:8px 0;">
                  <strong>Venue:</strong>
                  The Granville Centre
                </p>

                <p style="margin:8px 0 0;">
                  <strong>Address:</strong>
                  1 Memorial Drive,
                  Granville NSW 2142
                </p>
              </div>

              <div
                style="
                  margin:28px 0;
                  text-align:center;
                "
              >
                <a
                  href="${safeTicketUrl}"
                  style="
                    display:inline-block;
                    padding:15px 28px;
                    background:#7a3f2b;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:700;
                  "
                >
                  Open My Ticket
                </a>
              </div>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  color:#625851;
                  line-height:1.6;
                "
              >
                You may show the QR directly from
                this email, save a screenshot, or
                use the Open My Ticket button.
              </p>

              <p
                style="
                  margin:22px 0 0;
                  font-size:13px;
                  color:#8a817b;
                  line-height:1.6;
                "
              >
                Sat-Chit-Ānanda · Project Beyond
              </p>
            </div>
          </div>
        `,

        attachments: [
          {
            content:
              qrBase64,

            filename:
              "sat-chit-ananda-ticket.png",

            content_id:
              "sat-chit-ananda-ticket-qr",
          },
        ],
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

export async function POST(
  request,
) {
  try {
    const body =
      await request.json();

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
            friendlyMessages[
              field
            ] ||
            "Please check the information and try again.",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Honeypot
    */
    if (
      parsed.data.website
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    const email =
      normalizeEmail(
        parsed.data.email,
      );

    const phone =
      normalizeAustralianMobile(
        parsed.data.phone,
      );

    /*
      EMAIL VALIDATION
    */
    if (
      !isValidEmailFormat(
        email,
      )
    ) {
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

    const emailSuggestion =
      getEmailSuggestion(
        email,
      );

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
      MOBILE VALIDATION
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

    const qrToken =
      makeQrToken();

    /*
      CREATE REGISTRATION
    */
    const {
      data,
      error,
    } = await supabase.rpc(
      "register_for_event",
      {
        p_event_slug:
          EVENT_SLUG,

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

      if (
        error.code === "23505"
      ) {
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

      if (
        error.message?.includes(
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

      if (
        error.message?.includes(
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

    if (!result) {
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

    /*
      IMPORTANT:

      The new system does NOT use email verification.

      All we need to do after registration is
      store the QR token.
    */
    const {
      data:
        updatedRegistration,
      error:
        updateError,
    } = await supabase
      .from("registrations")
      .update({
        qr_token:
          qrToken,
      })
      .eq(
        "registration_code",
        registrationCode,
      )
      .select(`
        id,
        registration_code,
        full_name,
        email,
        phone,
        ticket_quantity,
        status,
        checked_in,
        qr_token,
        created_at
      `)
      .single();

    if (
      updateError ||
      !updatedRegistration
    ) {
      console.error(
        "QR setup error:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Your registration was received, but the QR ticket could not be prepared. Please contact the organiser.",
        },
        {
          status: 500,
        },
      );
    }

    /*
      Automatically generates the correct
      domain for localhost, Preview or production.
    */
    const baseUrl =
      new URL(
        request.url,
      ).origin;

    const ticketUrl =
      `${baseUrl}/ticket/` +
      encodeURIComponent(
        qrToken,
      );

    /*
      Generate the QR image using the
      exact ticket URL.
    */
    const qrBase64 =
      await makeQrPngBase64(
        ticketUrl,
      );

    /*
      Registration stays valid even if
      email delivery fails.
    */
    let emailSent =
      false;

    try {
      await sendRegistrationEmail({
        email,

        fullName:
          updatedRegistration
            .full_name,

        registrationCode:
          updatedRegistration
            .registration_code,

        ticketUrl,

        qrBase64,
      });

      emailSent = true;
    } catch (emailError) {
      console.error(
        "Registration email error:",
        emailError,
      );
    }

    return NextResponse.json({
      success: true,

      registration: {
        code:
          updatedRegistration
            .registration_code,

        fullName:
          updatedRegistration
            .full_name,

        ticketQuantity:
          updatedRegistration
            .ticket_quantity,

        qrToken,

        ticketUrl,
      },

      emailSent,

      message:
        emailSent
          ? "Registration completed successfully. Your QR ticket has also been sent to your email."
          : "Registration completed successfully. Your QR ticket is ready, but the confirmation email could not be sent.",
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