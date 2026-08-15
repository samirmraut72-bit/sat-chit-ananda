import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const secretKey =
  process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error(
    "Missing Supabase environment variables.",
  );
}

const supabase = createClient(
  supabaseUrl,
  secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const scannerEmails = [
  "scanner01@satchitananda.com.au",
  "scanner02@satchitananda.com.au",
  "scanner03@satchitananda.com.au",
  "scanner04@satchitananda.com.au",
  "scanner05@satchitananda.com.au",
  "scanner06@satchitananda.com.au",
  "scanner07@satchitananda.com.au",
  "scanner08@satchitananda.com.au",
  "scanner09@satchitananda.com.au",
  "scanner10@satchitananda.com.au",
];

const password = "scan 2026";

const {
  data,
  error,
} =
  await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

if (error) {
  throw error;
}

for (const email of scannerEmails) {
  const user =
    data.users.find(
      (item) =>
        item.email?.toLowerCase() ===
        email.toLowerCase(),
    );

  if (!user) {
    console.log(
      `NOT FOUND: ${email}`,
    );

    continue;
  }

  const {
    error: updateError,
  } =
    await supabase.auth.admin.updateUserById(
      user.id,
      {
        password,
        email_confirm: true,
      },
    );

  if (updateError) {
    console.log(
      `FAILED: ${email}`,
      updateError.message,
    );
  } else {
    console.log(
      `UPDATED: ${email}`,
    );
  }
}