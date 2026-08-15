import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const email = "scanner01@satchitananda.com.au";
const password = "scan 2026";

const { data, error } =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

if (error) {
  console.log("LOGIN FAILED");
  console.log("Message:", error.message);
  console.log("Status:", error.status);
} else {
  console.log("LOGIN SUCCESS");
  console.log("Email:", data.user?.email);
  console.log("User ID:", data.user?.id);
}