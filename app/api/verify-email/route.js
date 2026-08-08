import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const token =
      searchParams.get("token");

    if (!token) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Invalid verification link</h1>

              <p>
                The verification token is missing.
              </p>

              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 400,

          headers: {
            "Content-Type":
              "text/html; charset=utf-8",
          },
        },
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: registration,
      error: findError,
    } = await supabase
      .from("registrations")
      .select(`
        id,
        registration_code,
        full_name,
        email_verified,
        verification_token,
        verification_expires_at,
        qr_token
      `)
      .eq(
        "verification_token",
        token,
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "Verification lookup error:",
        findError,
      );

      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Verification failed</h1>

              <p>
                We could not verify your registration.
              </p>

              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 500,

          headers: {
            "Content-Type":
              "text/html; charset=utf-8",
          },
        },
      );
    }

    if (!registration) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Invalid ticket link</h1>

              <p>
                This ticket link could not
                be found.
              </p>

              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 404,

          headers: {
            "Content-Type":
              "text/html; charset=utf-8",
          },
        },
      );
    }

    /*
      CHECK EXPIRY FIRST.

      This is deliberately before the
      already-verified check.

      Therefore even a previously verified
      attendee cannot use this link after
      midnight at the end of 14 August.
    */
    if (
      registration.verification_expires_at &&
      new Date(
        registration.verification_expires_at,
      ).getTime() <= Date.now()
    ) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Ticket link expired</h1>

              <p>
                This Sat-Chit-Ānanda ticket
                link expired at 12:00 AM on
                15 August 2026.
              </p>

              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 410,

          headers: {
            "Content-Type":
              "text/html; charset=utf-8",
          },
        },
      );
    }

    /*
      ALREADY VERIFIED

      Reopening the verification email
      simply sends the attendee back to
      the SAME QR ticket.

      No new QR token is generated.
    */
    if (
      registration.email_verified === true &&
      registration.qr_token
    ) {
      return NextResponse.redirect(
        new URL(
          `/ticket/${registration.qr_token}`,
          request.url,
        ),
      );
    }

    /*
      FIRST SUCCESSFUL VERIFICATION

      Use the existing QR token if somehow
      one already exists.

      Otherwise create the QR token once.
    */
    const qrToken =
      registration.qr_token ||
      randomUUID().replaceAll(
        "-",
        "",
      );

    /*
      IMPORTANT:

      Keep verification_token.

      Keep verification_expires_at.

      Do NOT set either one to null.

      This allows unlimited reopening until
      the expiry date while preserving the
      SAME QR token.
    */
    const { error: updateError } =
      await supabase
        .from("registrations")
        .update({
          email_verified: true,
          qr_token: qrToken,
          verification_token: token,
        })
        .eq(
          "id",
          registration.id,
        );

    if (updateError) {
      console.error(
        "Verification update error:",
        updateError,
      );

      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Verification failed</h1>

              <p>
                We could not confirm your registration.
              </p>

              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 500,

          headers: {
            "Content-Type":
              "text/html; charset=utf-8",
          },
        },
      );
    }

    return NextResponse.redirect(
      new URL(
        `/ticket/${qrToken}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error(
      "Unexpected verification error:",
      error,
    );

    return new NextResponse(
      `
        <html>
          <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
            <h1>Something went wrong</h1>

            <p>
              Please try opening your
              ticket link again.
            </p>

            <a href="https://satchitananda.com.au">
              Return to Sat-Chit-Ānanda
            </a>
          </body>
        </html>
      `,
      {
        status: 500,

        headers: {
          "Content-Type":
            "text/html; charset=utf-8",
        },
      },
    );
  }
}