import { redirect } from "next/navigation";

import FeedbackResultsDashboard from "./FeedbackResultsDashboard";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function FeedbackResultsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("admin_users")
    .select("user_id, role, email, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/admin/login?error=unauthorized");
  }

  if (profile.role !== "owner") {
    redirect("/scanner");
  }

  const {
    data: summary,
    error: summaryError,
  } = await admin
    .from("feedback_summary")
    .select("total_submissions, updated_at")
    .eq("id", 1)
    .maybeSingle();

  const {
    data: counts,
    error: countsError,
  } = await admin
    .from("feedback_option_counts")
    .select(
      "question_id, option_value, response_count",
    )
    .order("question_id")
    .order("response_count", {
      ascending: false,
    });

  if (summaryError) {
    console.error(
      "Feedback summary query failed:",
      summaryError,
    );
  }

  if (countsError) {
    console.error(
      "Feedback counts query failed:",
      countsError,
    );
  }

  return (
    <FeedbackResultsDashboard
      totalSubmissions={
        summary?.total_submissions || 0
      }
      counts={counts || []}
    />
  );
}