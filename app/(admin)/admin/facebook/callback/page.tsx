import { redirect } from "next/navigation";
import { exchangeCodeForToken, getUserPages } from "@/lib/facebook";
import { saveSiteSettings } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";

export default async function FacebookCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string; error_description?: string };
}) {
  const { code, error, error_description } = searchParams;

  if (error) {
    redirect(`/admin/facebook?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    redirect("/admin/facebook?error=No authorization code received");
  }

  try {
    // Exchange code for user access token
    const userAccessToken = await exchangeCodeForToken(
      code,
      `${process.env.NEXT_PUBLIC_SITE_URL}/admin/facebook/callback`
    );

    // Get user's pages
    const pages = await getUserPages(userAccessToken);

    if (pages.length === 0) {
      redirect("/admin/facebook?error=No Facebook pages found. Please create a page first.");
    }

    // For simplicity, we'll use the first page
    // In production, you might want to show a page selector
    const page = pages[0];

    // Save to database
    await saveSiteSettings({
      facebookPageId: page.id,
      facebookPageAccessToken: page.access_token,
      facebookPageName: page.name,
      facebookConnected: true,
      facebookAutoPost: false, // Default to off
      facebookConnectedAt: new Date(),
    });

    revalidatePath("/admin/facebook");
    redirect("/admin/facebook?success=connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect Facebook";
    redirect(`/admin/facebook?error=${encodeURIComponent(message)}`);
  }
}
