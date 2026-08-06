import { AdminShell } from "@/components/admin/admin-shell";
import { UserProfileForm } from "@/components/admin/user-profile-form";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminUserPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      kicker="সিস্টেম"
      title="আমার প্রোফাইল"
      description="নাম, যোগাযোগের তথ্য ও লগইন পাসওয়ার্ড হালনাগাদ করুন।"
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
