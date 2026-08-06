import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  exchangeCodeForToken,
  exchangeForLongLivedUserToken,
  FACEBOOK_OAUTH_STATE_COOKIE,
  getUserPages,
} from "@/lib/facebook";
import { saveSiteSettings } from "@/lib/site-settings";

type Props = {
  searchParams: Promise<{ code?: string; state?: string; error?: string; error_description?: string }>;
};

function failure(message: string): never {
  redirect(`/admin/facebook?error=${encodeURIComponent(message)}`);
}

export default async function FacebookCallbackPage({ searchParams }: Props) {
  const { code, state, error, error_description } = await searchParams;

  if (error) failure(error_description || error);
  if (!code) failure("No authorization code received");

  // The `state` cookie was set when this admin started the flow. A callback that
  // doesn't carry the matching value was not initiated here, so we refuse it
  // rather than trading a stranger's code for a page token.
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(FACEBOOK_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(FACEBOOK_OAUTH_STATE_COOKIE);
  if (!expectedState || !state || state !== expectedState) {
    failure("Invalid or expired authorization request. Please try connecting again.");
  }

  try {
    // Must match the redirect_uri used to start the flow — derived from the
    // request host, never from a query parameter.
    const hdrs = await headers();
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
    const proto = hdrs.get("x-forwarded-proto") ?? "https";

    const shortLivedToken = await exchangeCodeForToken(
      code,
      `${proto}://${host}/admin/facebook/callback`,
    );

    // Upgrade before reading pages: a page token inherits the lifetime of the
    // user token it was derived from, so deriving from the short-lived one
    // would hand us a connection that dies within hours.
    const userAccessToken = await exchangeForLongLivedUserToken(shortLivedToken);
    const pages = await getUserPages(userAccessToken);

    if (pages.length === 0) {
      failure("No Facebook pages found. Please create a page first.");
    }

    // Use the first page. A page selector would go here if an admin manages more
    // than one.
    const page = pages[0];

    await saveSiteSettings({
      facebookPageId: page.id,
      facebookPageAccessToken: page.access_token,
      facebookPageName: page.name,
      facebookConnected: true,
      facebookAutoPost: false, // Default to off
      facebookConnectedAt: new Date(),
    });

    revalidatePath("/admin/facebook");
  } catch (err) {
    // `redirect`/`notFound` unwind by throwing — those must not be swallowed.
    unstable_rethrow(err);
    console.error("[facebook/callback] Connect failed:", err);
    failure("Failed to connect Facebook");
  }

  redirect("/admin/facebook?success=connected");
}
