import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[+()\-\s0-9]+$/),
  ticketQuantity: z.coerce.number().int().min(1).max(1),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

function makeRegistrationCode() {
  return `SCA-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = registrationSchema.safeParse({
      ...body,
      ticketQuantity: 1,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];

      const friendlyMessages = {
        fullName: "Please enter your full name.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid mobile number.",
        ticketQuantity: "Only one place can be reserved per registration.",
        consent: "Please accept the registration agreement.",
      };

      const field = issue?.path?.[0];

      return NextResponse.json(
        {
          error:
            friendlyMessages[field] ||
            "Please check the information and try again.",
        },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({
        success: true,
        registration: {
          code: makeRegistrationCode(),
          fullName: parsed.data.fullName,
          ticketQuantity: 1,
        },
      });
    }

    const supabase = createAdminClient();
    const registrationCode = makeRegistrationCode();

    const { data, error } = await supabase.rpc("register_for_event", {
      p_event_slug: "sat-chit-ananda-2026",
      p_registration_code: registrationCode,
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_ticket_quantity: 1,
    });

    if (error) {
      console.error("Registration database error:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This email address or mobile number has already been registered.",
          },
          { status: 409 },
        );
      }

      if (error.message.includes("ONE_RESERVATION_ONLY")) {
        return NextResponse.json(
          {
            error: "Only one place can be reserved per registration.",
          },
          { status: 400 },
        );
      }

      if (error.message.includes("CAPACITY_EXCEEDED")) {
        return NextResponse.json(
          {
            error: "The event has reached its maximum capacity.",
          },
          { status: 409 },
        );
      }

      if (error.message.includes("REGISTRATION_CLOSED")) {
        return NextResponse.json(
          {
            error: "Registration is currently closed.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: "Registration could not be completed. Please try again.",
        },
        { status: 500 },
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      registration: {
        code: result.registration_code,
        fullName: result.full_name,
        ticketQuantity: 1,
        totalPrice: Number(result.total_price),
      },
    });
  } catch (error) {
    console.error("Unexpected registration error:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}