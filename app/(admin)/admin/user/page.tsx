import { AdminShell } from "@/components/admin/admin-shell";
import { UserProfileForm } from "@/components/admin/user-profile-form";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

export default async function AdminUserPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="User"
      description="Manage admin profile details and password."
    >
      <UserProfileForm
        initial={{
          adminName: settings?.adminName,
          adminEmail: settings?.adminEmail,
          adminPhone: settings?.adminPhone,
          fallbackEmail: env.ADMIN_EMAIL,
        }}
      />
    </AdminShell>
  );
}
