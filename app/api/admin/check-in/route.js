import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  registrationId: z.string().uuid(),
  checkedIn: z.boolean(),
});

export async function PATCH(request) {
  try {
    const body = await request.json();

    const parsed =
      schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid check-in request.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your admin session has expired.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: adminProfile,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      adminError ||
      !adminProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator permission is required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
      Build the check-in audit values.

      CHECK IN:
      checked_in = true
      checked_in_at = current time
      checked_in_by = signed-in admin

      UNDO:
      checked_in = false
      checked_in_at = null
      checked_in_by = null
    */
    const updateValues =
      parsed.data.checkedIn
        ? {
            checked_in: true,
            checked_in_at:
              new Date().toISOString(),
            checked_in_by:
              user.email ||
              user.id,
          }
        : {
            checked_in: false,
            checked_in_at: null,
            checked_in_by: null,
          };

    const {
      data,
      error,
    } = await supabase
      .from("registrations")
      .update(updateValues)
      .eq(
        "id",
        parsed.data.registrationId,
      )
      .select(`
        id,
        checked_in,
        checked_in_at,
        checked_in_by
      `)
      .single();

    if (error) {
      console.error(
        "Check-in update failed:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Check-in could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      checkedIn:
        data.checked_in,

      checkedInAt:
        data.checked_in_at,

      checkedInBy:
        data.checked_in_by,
    });
  } catch (error) {
    console.error(
      "Unexpected check-in error:",
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