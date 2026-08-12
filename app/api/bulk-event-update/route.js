import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RESEND_BATCH_URL =
  "https://api.resend.com/emails/batch";

const FROM_EMAIL =
  "Sat-Chit-Ānanda <tickets@mail.satchitananda.com.au>";

const INSTAGRAM_URL =
  "https://www.instagram.com/theproject_beyond";

const TIKTOK_URL =
  "https://www.tiktok.com/@project_beyond_1";

function emailHtml(name) {
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
          margin:0 0 20px;
          font-size:29px;
        ">
          Important Event Information
        </h1>

        <p>
          Dear ${name || "Sat-Chit-Ānanda Family"},
        </p>

        <p style="line-height:1.7;">
          Thank you for registering and for choosing
          to be part of <strong>Sat-Chit-Ānanda</strong>.
        </p>

        <p style="line-height:1.7;">
          We are truly grateful for the wonderful
          response from our community. With all
          available places now reserved,
          <strong>registration is officially closed.</strong>
        </p>

        <p style="line-height:1.7;">
          We look forward to coming together for an
          evening of music, stillness, connection,
          and shared experience.
        </p>

        <div style="
          margin:26px 0;
          padding:20px;
          background:#faf7f3;
          border-radius:12px;
        ">

          <h2 style="
            margin:0 0 16px;
            font-size:20px;
          ">
            Event Details
          </h2>

          <p>
            <strong>Date:</strong>
            Friday, 14 August 2026
          </p>

          <p>
            <strong>Venue:</strong>
            The Granville Centre
          </p>

          <p>
            <strong>Doors Open:</strong>
            6:00 PM
          </p>

          <p>
            <strong>Program Starts:</strong>
            Sharp at 6:45 PM
          </p>

          <p>
            <strong>Doors Close:</strong>
            7:00 PM
          </p>
        </div>

        <p style="line-height:1.7;">
          To help us begin on time and maintain the
          flow of the evening, we kindly request
          everyone to <strong>arrive early and be
          seated before 6:45 PM.</strong>
        </p>

        <p style="line-height:1.7;">
          Please note that
          <strong>entry will not be available after
          the doors close at 7:00 PM.</strong>
        </p>

        <p style="line-height:1.7;">
          For important updates, event moments, and
          information about our future gatherings,
          please stay connected with
          <strong>Project Beyond</strong>.
        </p>

        <div style="
          margin:24px 0;
          text-align:center;
        ">

          <a
            href="${INSTAGRAM_URL}"
            style="
              display:inline-block;
              margin:6px;
              padding:13px 20px;
              background:#7a3f2b;
              color:#ffffff;
              text-decoration:none;
              border-radius:9px;
              font-weight:700;
            "
          >
            Follow on Instagram
          </a>

          <a
            href="${TIKTOK_URL}"
            style="
              display:inline-block;
              margin:6px;
              padding:13px 20px;
              background:#29231f;
              color:#ffffff;
              text-decoration:none;
              border-radius:9px;
              font-weight:700;
            "
          >
            Follow on TikTok
          </a>

        </div>

        <p style="line-height:1.7;">
          Thank you once again for your trust,
          support, and presence. Your participation
          is what brings Sat-Chit-Ānanda to life,
          and we are grateful to have you as part
          of this growing family.
        </p>

        <p style="line-height:1.7;">
          We look forward to welcoming you.
        </p>

        <p style="
          margin-top:28px;
          line-height:1.7;
        ">
          With warmth and gratitude,<br>
          <strong>Project Beyond Team</strong><br>
          <em>In collaboration with NRNA NSW</em>
        </p>

      </div>
    </div>
  `;
}

function splitIntoChunks(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(
      array.slice(i, i + size)
    );
  }

  return chunks;
}

async function sendBatch(emails, batchNumber) {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing."
    );
  }

  const response =
    await fetch(
      RESEND_BATCH_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            `sat-chit-ananda-event-update-${batchNumber}-20260812`,
        },

        body:
          JSON.stringify(emails),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    console.error(
      "Resend batch failed:",
      result
    );

    throw new Error(
      result?.message ||
      result?.error?.message ||
      "Resend batch failed."
    );
  }

  return result;
}

export async function POST(request) {
  try {
    const expectedSecret =
      process.env.BULK_EMAIL_SECRET;

    const suppliedSecret =
      request.headers.get(
        "x-bulk-email-secret"
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
        }
      );
    }

    const body =
      await request.json();

    const mode =
      body?.mode || "test";

    const testEmail =
      String(
        body?.testEmail || ""
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
        full_name,
        email,
        status
      `)
      .eq(
        "status",
        "confirmed"
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "Registration query error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Could not load registrations.",
        },
        {
          status: 500,
        }
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
              "testEmail is required.",
          },
          {
            status: 400,
          }
        );
      }

      const registration =
        registrations.find(
          (item) =>
            item.email
              ?.trim()
              .toLowerCase() ===
            testEmail
        );

      if (!registration) {
        return NextResponse.json(
          {
            error:
              "Confirmed registration not found.",
          },
          {
            status: 404,
          }
        );
      }

      const payload = [
        {
          from: FROM_EMAIL,

          to: [
            registration.email
          ],

          subject:
            "Important Event Information – Sat-Chit-Ānanda",

          html:
            emailHtml(
              registration.full_name
            ),
        },
      ];

      await sendBatch(
        payload,
        "test"
      );

      return NextResponse.json({
        success: true,
        mode: "test",
        email:
          registration.email,
      });
    }

    /*
      BULK SEND
    */
    if (mode !== "all") {
      return NextResponse.json(
        {
          error:
            'Mode must be "test" or "all".',
        },
        {
          status: 400,
        }
      );
    }

    const validRegistrations =
      registrations.filter(
        (registration) =>
          Boolean(
            registration.email
          )
      );

    const emailPayloads =
      validRegistrations.map(
        (registration) => ({
          from: FROM_EMAIL,

          to: [
            registration.email
          ],

          subject:
            "Important Event Information – Sat-Chit-Ānanda",

          html:
            emailHtml(
              registration.full_name
            ),
        })
      );

    /*
      Resend allows maximum
      100 emails per batch.
    */
    const batches =
      splitIntoChunks(
        emailPayloads,
        100
      );

    const results = [];

    for (
      let index = 0;
      index < batches.length;
      index++
    ) {
      const result =
        await sendBatch(
          batches[index],
          index + 1
        );

      results.push({
        batch:
          index + 1,

        count:
          batches[index].length,

        success: true,
      });
    }

    return NextResponse.json({
      success: true,

      mode: "all",

      totalConfirmed:
        registrations.length,

      totalSent:
        emailPayloads.length,

      batchCount:
        batches.length,

      batches:
        results,
    });
  } catch (error) {
    console.error(
      "Bulk event update failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bulk send failed.",
      },
      {
        status: 500,
      }
    );
  }
}