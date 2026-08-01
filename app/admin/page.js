import { redirect } from "next/navigation";

import AdminDashboard from "./AdminDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminProfile } = await supabase
    .from("admin_users")
    .select("display_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminProfile) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const { data: registrations, error } = await supabase
    .from("registrations")
    .select(
      "id, registration_code, full_name, email, phone, ticket_quantity, status, checked_in, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin registration query failed:", error);
  }

  return (
    <AdminDashboard
      initialRegistrations={registrations || []}
      adminName={adminProfile.display_name || adminProfile.email}
      adminEmail={adminProfile.email}
    />
  );
}
