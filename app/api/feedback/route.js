import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const OPTIONS = {
  organisation: [
    "Excellent",
    "Very good",
    "Good",
    "Fair",
    "Poor",
  ],

  communication: [
    "Very clear",
    "Clear",
    "Acceptable",
    "Unclear",
    "Very unclear",
  ],

  coordination: [
    "Excellent",
    "Very good",
    "Good",
    "Fair",
    "Poor",
  ],

  rehearsal: [
    "Very effective",
    "Effective",
    "Acceptable",
    "Ineffective",
    "Very ineffective",
  ],

  soundcheck: [
    "Excellent",
    "Very good",
    "Good",
    "Fair",
    "Poor",
  ],

  soundQuality: [
    "Excellent",
    "Very good",
    "Good",
    "Fair",
    "Poor",
  ],

  schedule: [
    "Completely according to plan",
    "Mostly according to plan",
    "Some delays",
    "Significant delays",
    "Very poorly managed",
  ],

  transitions: [
    "Excellent",
    "Very good",
    "Good",
    "Fair",
    "Poor",
  ],

  responsibilityClarity: [
    "Completely clear",
    "Mostly clear",
    "Somewhat clear",
    "Mostly unclear",
    "Completely unclear",
  ],

  preparedness: [
    "Fully prepared",
    "Well prepared",
    "Moderately prepared",
    "Slightly unprepared",
    "Not prepared",
  ],

  biggestImprovement: [
    "Communication",
    "Planning and scheduling",
    "Rehearsals",
    "Sound / technical setup",
    "Stage coordination",
    "Artist coordination",
    "Volunteer coordination",
    "Audience management",
  ],

  strongestArea: [
    "Performances",
    "Teamwork",
    "Audience atmosphere",
    "Sound",
    "Organisation",
    "Venue",
    "Registration / entry",
    "Overall concept",
  ],

  managementFocus: [
    "Earlier planning",
    "Clearer communication",
    "Better scheduling",
    "Clearer responsibilities",
    "Better rehearsal coordination",
    "Better technical preparation",
    "Current management worked well",
  ],

  artistFocus: [
    "Preparation",
    "Rehearsal attendance",
    "Punctuality",
    "Communication",
    "Stage transitions",
    "Coordination with other musicians",
    "Nothing significant",
  ],

  workAgain: [
    "Definitely",
    "Probably",
    "Not sure",
    "Probably not",
    "Definitely not",
  ],
};

const schemaShape = Object.fromEntries(
  Object.entries(OPTIONS).map(([key, options]) => [
    key,
    z.enum(options),
  ]),
);

const feedbackSchema = z
  .object(schemaShape)
  .strict();

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed =
      feedbackSchema.safeParse(body);

    if (!parsed.success) {
      console.error(
        "Feedback validation error:",
        parsed.error.flatten(),
      );

      return NextResponse.json(
        {
          error:
            "Please answer all 15 questions before submitting.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      createAdminClient();

    const { error } =
      await supabase.rpc(
        "submit_event_feedback",
        {
          p_answers: parsed.data,
        },
      );

    if (error) {
      console.error(
        "Feedback Supabase error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Your feedback could not be submitted. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Thank you. Your anonymous feedback has been recorded.",
    });
  } catch (error) {
    console.error(
      "Unexpected feedback error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Your feedback could not be submitted. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}