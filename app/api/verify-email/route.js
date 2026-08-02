import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Invalid verification link</h1>
              <p>The verification token is missing.</p>
              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    }

    const supabase = createAdminClient();

    const { data: registration, error: findError } = await supabase
      .from("registrations")
      .select(
        `
          id,
          registration_code,
          full_name,
          email_verified,
          verification_expires_at,
          qr_token
        `,
      )
      .eq("verification_token", token)
      .maybeSingle();

    if (findError) {
      console.error("Verification lookup error:", findError);

      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Verification failed</h1>
              <p>We could not verify your registration.</p>
              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 500,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    }

    if (!registration) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Invalid verification link</h1>
              <p>This link is invalid or has already been used.</p>
              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    }

    if (
      registration.verification_expires_at &&
      new Date(registration.verification_expires_at).getTime() < Date.now()
    ) {
      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Verification link expired</h1>
              <p>This verification link has expired.</p>
              <a href="https://satchitananda.com.au/register">
                Register again
              </a>
            </body>
          </html>
        `,
        {
          status: 410,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    }

    const qrToken =
      registration.qr_token || randomUUID().replaceAll("-", "");

    const { error: updateError } = await supabase
      .from("registrations")
      .update({
        email_verified: true,
        qr_token: qrToken,
        verification_token: null,
        verification_expires_at: null,
      })
      .eq("id", registration.id);

    if (updateError) {
      console.error("Verification update error:", updateError);

      return new NextResponse(
        `
          <html>
            <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
              <h1>Verification failed</h1>
              <p>We could not confirm your registration.</p>
              <a href="https://satchitananda.com.au">
                Return to Sat-Chit-Ānanda
              </a>
            </body>
          </html>
        `,
        {
          status: 500,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    }

    return NextResponse.redirect(
      new URL(`/ticket/${qrToken}`, request.url),
    );
  } catch (error) {
    console.error("Unexpected verification error:", error);

    return new NextResponse(
      `
        <html>
          <body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
            <h1>Something went wrong</h1>
            <p>Please try opening the verification link again.</p>
            <a href="https://satchitananda.com.au">
              Return to Sat-Chit-Ānanda
            </a>
          </body>
        </html>
      `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );
  }
}