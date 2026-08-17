import { redirect } from "next/navigation";

import AdminDashboard from "./AdminDashboard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();

  const {
    data: adminProfile,
    error: adminError,
  } = await admin
    .from("admin_users")
    .select("user_id, display_name, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminProfile) {
    redirect("/admin/login?error=unauthorized");
  }

  if (adminProfile.role !== "owner") {
    redirect("/scanner");
  }

  const {
    data: registrations,
    error,
  } = await admin
    .from("registrations")
    .select(`
      id,
      registration_code,
      full_name,
      email,
      phone,
      ticket_quantity,
      status,
      checked_in,
      checked_in_at,
      checked_in_by,
      created_at,
      qr_token
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Admin registration query failed:",
      error,
    );
  }

  return (
    <AdminDashboard
      initialRegistrations={registrations || []}
      adminName={
        adminProfile.display_name ||
        adminProfile.email ||
        user.email ||
        "Owner"
      }
      adminEmail={
        adminProfile.email ||
        user.email ||
        ""
      }
    />
  );
}