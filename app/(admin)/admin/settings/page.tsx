import { AdminShell } from "@/components/admin/admin-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="Settings"
      description="Configure footer contact information."
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
