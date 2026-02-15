import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSettings } from "@/lib/site-settings";
import { isFacebookConfigured, getFacebookAppId } from "@/lib/facebook";
import { FacebookConnectClient } from "./facebook-connect-client";

export const metadata = {
  title: "Facebook Integration",
  description: "Connect your Facebook page and auto-share news posts",
};

export default async function FacebookPage() {
  const settings = await getSiteSettings();
  const configured = await isFacebookConfigured();
  const appId = await getFacebookAppId();

  return (
    <AdminShell
      title="Facebook Integration"
      description="Connect your Facebook page to automatically share news posts"
    >
      <FacebookConnectClient
        settings={{
          connected: settings?.facebookConnected ?? false,
          pageId: settings?.facebookPageId ?? null,
          pageName: settings?.facebookPageName ?? null,
          autoPost: settings?.facebookAutoPost ?? false,
          connectedAt: settings?.facebookConnectedAt ?? null,
          appId: appId,
        }}
        isConfigured={configured}
      />
    </AdminShell>
  );
}
