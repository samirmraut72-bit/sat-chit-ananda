import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL =
  "https://satchitananda.com.au";

const RESEND_URL =
  "https://api.resend.com/emails";

const FROM_EMAIL =
  "Sat-Chit-Ānanda <tickets@mail.satchitananda.com.au>";

const EVENT_DATE =
  "Friday, 14 August 2026";

const EVENT_TIME =
  "6:45 PM – 9:00 PM";

const EVENT_VENUE =
  "The Granville Centre";

const EVENT_ADDRESS =
  "1 Memorial Drive, Granville NSW 2142";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function sendEmail({
  to,
  subject,
  html,
}) {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing.",
    );
  }

  const response =
    await fetch(
      RESEND_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Resend rejected the email.",
    );
  }

  return result;
}

function ticketEmailHtml(
  registration,
) {
  const ticketUrl =
    `${SITE_URL}/ticket/${registration.qr_token}`;

  return `
    <div style="
      margin:0;
      padding:32px 16px;
      background:#f5efe8;
      font-family:Arial,sans-serif;
      color:#29231f;
    ">
      <div style="
        max-width:620px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        padding:34px;
      ">
        <p style="
          margin:0 0 8px;
          color:#7a3f2b;
          font-size:13px;
          font-weight:700;
          letter-spacing:1px;
        ">
          SAT-CHIT-ĀNANDA
        </p>

        <h1 style="
          margin:0 0 18px;
          font-size:30px;
        ">
          Your QR ticket is ready
        </h1>

        <p>
          Namaste ${registration.full_name},
        </p>

        <p style="line-height:1.6;">
          Thank you for registering for
          Sat-Chit-Ānanda. Your registration
          is confirmed and your QR ticket is
          ready.
        </p>

        <div style="
          margin:26px 0;
          text-align:center;
        ">
          <a
            href="${ticketUrl}"
            style="
              display:inline-block;
              padding:15px 24px;
              background:#7a3f2b;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:700;
            "
          >
            Open My QR Ticket
          </a>
        </div>

        <div style="
          margin-top:24px;
          padding:18px;
          background:#faf7f3;
          border-radius:12px;
        ">
          <p>
            <strong>Date:</strong>
            ${EVENT_DATE}
          </p>

          <p>
            <strong>Time:</strong>
            ${EVENT_TIME}
          </p>

          <p>
            <strong>Venue:</strong>
            ${EVENT_VENUE}
          </p>

          <p>
            <strong>Address:</strong>
            ${EVENT_ADDRESS}
          </p>

          <p>
            <strong>Registration code:</strong>
            ${registration.registration_code}
          </p>
        </div>

        <p style="
          margin-top:24px;
          font-size:14px;
          color:#625851;
          line-height:1.6;
        ">
          Please keep this email or take a
          screenshot of your QR ticket before
          arriving at the venue.
        </p>

        <p style="
          margin-top:24px;
          font-size:13px;
          color:#8a817b;
        ">
          Sat-Chit-Ānanda · Project Beyond
        </p>
      </div>
    </div>
  `;
}

function verificationEmailHtml(
  registration,
) {
  const verificationUrl =
    `${SITE_URL}/api/verify-email?token=` +
    encodeURIComponent(
      registration.verification_token,
    );

  return `
    <div style="
      margin:0;
      padding:32px 16px;
      background:#f5efe8;
      font-family:Arial,sans-serif;
      color:#29231f;
    ">
      <div style="
        max-width:620px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        padding:34px;
      ">
        <p style="
          margin:0 0 8px;
          color:#7a3f2b;
          font-size:13px;
          font-weight:700;
          letter-spacing:1px;
        ">
          SAT-CHIT-ĀNANDA
        </p>

        <h1 style="
          margin:0 0 18px;
          font-size:30px;
        ">
          Please verify your registration
        </h1>

        <p>
          Namaste ${registration.full_name},
        </p>

        <p style="line-height:1.6;">
          You are registered for
          Sat-Chit-Ānanda, but your email
          address has not yet been verified.
        </p>

        <p style="line-height:1.6;">
          Please press the button below to
          verify your registration and open
          your QR ticket.
        </p>

        <div style="
          margin:26px 0;
          text-align:center;
        ">
          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:15px 24px;
              background:#7a3f2b;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:700;
            "
          >
            Verify & Open My QR Ticket
          </a>
        </div>

        <div style="
          margin-top:24px;
          padding:18px;
          background:#faf7f3;
          border-radius:12px;
        ">
          <p>
            <strong>Date:</strong>
            ${EVENT_DATE}
          </p>

          <p>
            <strong>Time:</strong>
            ${EVENT_TIME}
          </p>

          <p>
            <strong>Venue:</strong>
            ${EVENT_VENUE}
          </p>

          <p>
            <strong>Address:</strong>
            ${EVENT_ADDRESS}
          </p>

          <p>
            <strong>Registration code:</strong>
            ${registration.registration_code}
          </p>
        </div>

        <p style="
          margin-top:24px;
          font-size:14px;
          color:#625851;
          line-height:1.6;
        ">
          This is your existing registration.
          You do not need to register again.
        </p>

        <p style="
          margin-top:10px;
          font-size:14px;
          color:#625851;
        ">
          Your ticket link remains available
          until 12:00 AM on 15 August 2026.
        </p>

        <p style="
          margin-top:24px;
          font-size:13px;
          color:#8a817b;
        ">
          Sat-Chit-Ānanda · Project Beyond
        </p>
      </div>
    </div>
  `;
}

async function processRegistration(
  registration,
) {
  /*
    VERIFIED
  */
  if (
    registration.email_verified === true &&
    registration.qr_token
  ) {
    await sendEmail({
      to: registration.email,

      subject:
        "Your Sat-Chit-Ānanda QR Ticket",

      html:
        ticketEmailHtml(
          registration,
        ),
    });

    return "ticket";
  }

  /*
    UNVERIFIED
  */
  if (
    registration.email_verified !== true &&
    registration.verification_token
  ) {
    if (
      registration.verification_expires_at &&
      new Date(
        registration.verification_expires_at,
      ).getTime() <= Date.now()
    ) {
      return "expired";
    }

    await sendEmail({
      to: registration.email,

      subject:
        "Verify Your Sat-Chit-Ānanda Registration",

      html:
        verificationEmailHtml(
          registration,
        ),
    });

    return "verification";
  }

  return "skipped";
}

export async function POST(request) {
  try {
    const expectedSecret =
      process.env.BULK_EMAIL_SECRET;

    const suppliedSecret =
      request.headers.get(
        "x-bulk-email-secret",
      );

    /*
      SAFE DIAGNOSTIC:
      This does NOT print either secret.
      It only reports whether each value exists
      and how many characters it contains.
    */
    console.log(
      "Bulk secret diagnostic:",
      {
        expectedLoaded:
          Boolean(expectedSecret),

        expectedLength:
          expectedSecret
            ? expectedSecret.length
            : 0,

        suppliedLoaded:
          Boolean(suppliedSecret),

        suppliedLength:
          suppliedSecret
            ? suppliedSecret.length
            : 0,

        lengthsMatch:
          Boolean(
            expectedSecret &&
            suppliedSecret &&
            expectedSecret.length ===
              suppliedSecret.length
          ),
      }
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
        },
      );
    }

    const body =
      await request.json();

    const mode =
      body?.mode || "test";

    const testEmail =
      String(
        body?.testEmail || "",
      )
        .trim()
        .toLowerCase();

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
        status,
        email_verified,
        qr_token,
        verification_token,
        verification_expires_at
      `)
      .eq(
        "status",
        "confirmed",
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      );

    if (error) {
      console.error(
        "Bulk email database error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Could not load registrations.",
        },
        {
          status: 500,
        },
      );
    }

    /*
      TEST MODE
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
        registrations.find(
          (item) =>
            item.email
              ?.trim()
              .toLowerCase() ===
            testEmail,
        );

      if (!registration) {
        return NextResponse.json(
          {
            error:
              "No confirmed registration found for this email.",
          },
          {
            status: 404,
          },
        );
      }

      const result =
        await processRegistration(
          registration,
        );

      return NextResponse.json({
        success: true,
        mode: "test",
        email:
          registration.email,
        registrationCode:
          registration.registration_code,
        type: result,
      });
    }

    /*
      BULK MODE
    */
    if (mode !== "all") {
      return NextResponse.json(
        {
          error:
            'Mode must be "test" or "all".',
        },
        {
          status: 400,
        },
      );
    }

    const summary = {
      total:
        registrations.length,

      ticketsSent: 0,

      verificationEmailsSent: 0,

      expiredVerificationLinks: 0,

      skipped: 0,

      failed: 0,

      failures: [],
    };

    for (
      const registration
      of registrations
    ) {
      try {
        const result =
          await processRegistration(
            registration,
          );

        if (
          result === "ticket"
        ) {
          summary.ticketsSent +=
            1;
        } else if (
          result ===
          "verification"
        ) {
          summary.verificationEmailsSent +=
            1;
        } else if (
          result === "expired"
        ) {
          summary.expiredVerificationLinks +=
            1;
        } else {
          summary.skipped +=
            1;
        }
      } catch (sendError) {
        console.error(
          "Bulk attendee email failed:",
          registration.registration_code,
          sendError,
        );

        summary.failed +=
          1;

        summary.failures.push({
          registrationCode:
            registration.registration_code,

          message:
            sendError instanceof Error
              ? sendError.message
              : "Email failed.",
        });
      }

      await wait(600);
    }

    return NextResponse.json({
      success: true,
      mode: "all",
      summary,
    });
  } catch (error) {
    console.error(
      "Unexpected bulk email error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Bulk email operation failed.",
      },
      {
        status: 500,
      },
    );
  }
}