import { AdminShell } from "@/components/admin/admin-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      kicker="সিস্টেম"
      title="সাইট সেটিংস"
      description="পাঠকের কাছে প্রকাশিত যোগাযোগের তথ্য পরিচালনা করুন।"
    >
      <SiteSettingsForm
        initial={{
          contactAddress: settings?.contactAddress,
          contactPhone: settings?.contactPhone,
          contactEmail: settings?.contactEmail,
        }}
      />
    </AdminShell>
  );
}
