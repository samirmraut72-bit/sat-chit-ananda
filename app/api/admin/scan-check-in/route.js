import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  qrToken: z.string().trim().min(10).max(200),
});

function formatSydneyDateTime(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid QR ticket.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    /*
      Confirm signed-in user.
    */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Your scanner session has expired.",
        },
        {
          status: 401,
        },
      );
    }

    /*
      Confirm scanner permission.
    */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("admin_users")
      .select(`
        user_id,
        role,
        email,
        display_name
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      !["scanner", "owner"].includes(profile.role)
    ) {
      return NextResponse.json(
        {
          error: "Scanner permission is required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
      Live ticket lookup.
    */
    const {
      data: registration,
      error: lookupError,
    } = await supabase
      .from("registrations")
      .select(`
        id,
        registration_code,
        full_name,
        email,
        phone,
        ticket_quantity,
        status,
        checked_in,
        checked_in_at,
        checked_in_by,
        qr_token,
        created_at
      `)
      .eq("qr_token", parsed.data.qrToken)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "QR ticket lookup failed:",
        lookupError,
      );

      return NextResponse.json(
        {
          error: "Ticket could not be checked.",
        },
        {
          status: 500,
        },
      );
    }

    if (!registration) {
      return NextResponse.json(
        {
          error:
            "Ticket not found in the registration database.",
        },
        {
          status: 404,
        },
      );
    }

    /*
      Only confirmed registrations are valid.
    */
    if (registration.status !== "confirmed") {
      return NextResponse.json(
        {
          error:
            `${registration.full_name}'s registration is not confirmed.`,
        },
        {
          status: 409,
        },
      );
    }

    /*
      Duplicate scan.
    */
    if (registration.checked_in) {
      return NextResponse.json(
        {
          success: false,
          alreadyCheckedIn: true,
          registration,

          message:
            `${registration.full_name} has already been checked in.\n` +
            `Code: ${registration.registration_code}\n` +
            `Places: ${registration.ticket_quantity}\n` +
            `Checked in: ${formatSydneyDateTime(
              registration.checked_in_at,
            )}\n` +
            `Staff: ${registration.checked_in_by || "Unknown"}`,
        },
        {
          status: 409,
        },
      );
    }

    const checkedInAt =
      new Date().toISOString();

    /*
      Use authenticated account identity.

      Never accept staff identity from
      the browser request.
    */
    const checkedInBy =
      profile.email ||
      user.email ||
      user.id;

    /*
      Prevent simultaneous double check-in.
    */
    const {
      data: checkedInRegistration,
      error: checkInError,
    } = await supabase
      .from("registrations")
      .update({
        checked_in: true,
        checked_in_at: checkedInAt,
        checked_in_by: checkedInBy,
      })
      .eq("id", registration.id)
      .eq("checked_in", false)
      .select(`
        id,
        registration_code,
        full_name,
        email,
        phone,
        ticket_quantity,
        status,
        checked_in,
        checked_in_at,
        checked_in_by,
        qr_token,
        created_at
      `)
      .maybeSingle();

    if (checkInError) {
      console.error(
        "QR check-in update failed:",
        checkInError,
      );

      return NextResponse.json(
        {
          error: "Check-in could not be completed.",
        },
        {
          status: 500,
        },
      );
    }

    /*
      Another scanner may have checked in
      the ticket between lookup and update.
    */
    if (!checkedInRegistration) {
      const {
        data: latestRegistration,
        error: latestError,
      } = await supabase
        .from("registrations")
        .select(`
          id,
          registration_code,
          full_name,
          email,
          phone,
          ticket_quantity,
          status,
          checked_in,
          checked_in_at,
          checked_in_by,
          qr_token,
          created_at
        `)
        .eq("id", registration.id)
        .maybeSingle();

      if (latestError) {
        console.error(
          "Latest registration lookup failed:",
          latestError,
        );
      }

      const latest =
        latestRegistration ||
        registration;

      return NextResponse.json(
        {
          success: false,
          alreadyCheckedIn: true,
          registration: latest,

          message:
            `${latest.full_name} has already been checked in.\n` +
            `Code: ${latest.registration_code}\n` +
            `Places: ${latest.ticket_quantity}\n` +
            `Checked in: ${formatSydneyDateTime(
              latest.checked_in_at,
            )}\n` +
            `Staff: ${latest.checked_in_by || "Unknown"}`,
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json({
      success: true,
      registration:
        checkedInRegistration,

      message:
        `${checkedInRegistration.full_name} checked in successfully.\n` +
        `Code: ${checkedInRegistration.registration_code}\n` +
        `Places: ${checkedInRegistration.ticket_quantity}\n` +
        `Checked in: ${formatSydneyDateTime(
          checkedInRegistration.checked_in_at,
        )}\n` +
        `Staff: ${checkedInRegistration.checked_in_by}`,
    });
  } catch (error) {
    console.error(
      "Unexpected QR check-in error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The QR ticket could not be processed.",
      },
      {
        status: 500,
      },
    );
  }
}