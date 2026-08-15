import { redirect } from "next/navigation";

import ScannerDashboard from "./ScannerDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/scanner/login");
  }

  const { data: profile, error } = await supabase
    .from("admin_users")
    .select("user_id, display_name, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    await supabase.auth.signOut();
    redirect("/scanner/login?error=unauthorized");
  }

  if (!["scanner", "owner"].includes(profile.role)) {
    await supabase.auth.signOut();
    redirect("/scanner/login?error=unauthorized");
  }

  return (
    <ScannerDashboard
      volunteerEmail={profile.email || user.email || ""}
      volunteerName={
        profile.display_name ||
        profile.email ||
        user.email ||
        "Volunteer"
      }
    />
  );
}