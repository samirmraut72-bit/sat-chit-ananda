import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_SLUG = "sat-chit-ananda-2026";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, capacity, registration_open")
      .eq("slug", EVENT_SLUG)
      .single();

    if (eventError || !event) {
      console.error("Availability event error:", eventError);

      return NextResponse.json(
        {
          error: "Event availability could not be loaded.",
        },
        { status: 500 },
      );
    }

    const { data: registrations, error: registrationError } = await supabase
      .from("registrations")
      .select("ticket_quantity")
      .eq("event_id", event.id)
      .eq("status", "confirmed");

    if (registrationError) {
      console.error(
        "Availability registration error:",
        registrationError,
      );

      return NextResponse.json(
        {
          error: "Event availability could not be loaded.",
        },
        { status: 500 },
      );
    }

    const registered = registrations.reduce(
      (total, registration) =>
        total + Number(registration.ticket_quantity || 0),
      0,
    );

    const available = Math.max(
      Number(event.capacity) - registered,
      0,
    );

    return NextResponse.json(
      {
        capacity: Number(event.capacity),
        registered,
        available,
        soldOut: available === 0,
        registrationOpen: event.registration_open,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Unexpected availability error:", error);

    return NextResponse.json(
      {
        error: "Event availability could not be loaded.",
      },
      { status: 500 },
    );
  }
}