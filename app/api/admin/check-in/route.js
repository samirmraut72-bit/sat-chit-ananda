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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid check-in request." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Your admin session has expired." },
        { status: 401 },
      );
    }

    const { data: adminProfile } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Administrator permission is required." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("registrations")
      .update({ checked_in: parsed.data.checkedIn })
      .eq("id", parsed.data.registrationId)
      .select("checked_in")
      .single();

    if (error) {
      console.error("Check-in update failed:", error);

      return NextResponse.json(
        { error: "Check-in could not be updated." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      checkedIn: data.checked_in,
    });
  } catch (error) {
    console.error("Unexpected check-in error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
