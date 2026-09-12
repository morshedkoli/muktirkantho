import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  exchangeCodeForToken,
  exchangeForLongLivedUserToken,
  FACEBOOK_OAUTH_STATE_COOKIE,
  getUserPages,
} from "@/lib/facebook";
import { saveSiteSettings } from "@/lib/site-settings";

/**
 * Facebook OAuth callback.
 *
 * A Route Handler rather than a page: the flow has to CLEAR the one-shot
 * `state` cookie, and Next only permits cookie mutation in a Server Action or
 * Route Handler. Doing it during a page render throws `ReadonlyRequestCookies`
 * before the code exchange ever runs, which left the connect flow dead on
 * arrival — the page could never be connected at all.
 *
 * Admin authentication is enforced upstream by proxy.ts (`/admin/:path*`).
 */
export const dynamic = "force-dynamic";

/** Origin as the browser sees it, matching the OAuth initiation logic. */
function publicOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!host) return request.nextUrl.origin;

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (!isLocal && process.env.NEXT_PUBLIC_SITE_URL && !forwardedProto) {
    try {
      const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      if (siteUrl.host === host) {
        return siteUrl.origin;
      }
    } catch {
      // fallback
    }
  }

  const proto = forwardedProto || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Every exit from this handler goes through here, so the nonce is consumed
 * whether the flow succeeded, failed or was rejected — a leftover cookie is a
 * replayable one.
 */
function leave(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, publicOrigin(request)));
  response.cookies.delete({ name: FACEBOOK_OAUTH_STATE_COOKIE, path: "/" });
  response.cookies.delete({ name: FACEBOOK_OAUTH_STATE_COOKIE, path: "/admin/facebook" });
  return response;
}

function failure(request: NextRequest, message: string): NextResponse {
  return leave(
    request,
    `/admin/facebook?notice=${encodeURIComponent(message)}&type=error&error=${encodeURIComponent(message)}`,
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const error = params.get("error");
  if (error) return failure(request, params.get("error_description") || error);

  const code = params.get("code");
  if (!code) return failure(request, "No authorization code received");

  // The `state` cookie was set when this admin started the flow. A callback that
  // doesn't carry the matching value was not initiated here, so we refuse it
  // rather than trading a stranger's code for a page token.
  const expectedState = request.cookies.get(FACEBOOK_OAUTH_STATE_COOKIE)?.value;
  const state = params.get("state");
  if (!expectedState || !state || state !== expectedState) {
    return failure(
      request,
      "Invalid or expired authorization request. Please try connecting again.",
    );
  }

  try {
    // Must match the redirect_uri used to start the flow — derived identically
    // to beginFacebookConnectAction.
    const shortLivedToken = await exchangeCodeForToken(
      code,
      `${publicOrigin(request)}/admin/facebook/callback`,
    );

    // Upgrade before reading pages: a page token inherits the lifetime of the
    // user token it was derived from, so deriving from the short-lived one
    // would hand us a connection that dies within hours.
    const userAccessToken = await exchangeForLongLivedUserToken(shortLivedToken);
    const pages = await getUserPages(userAccessToken);

    if (pages.length === 0) {
      return failure(request, "No Facebook pages found for your account. Please create a page first.");
    }

    // Use the first page. A page selector would go here if an admin manages more
    // than one.
    const page = pages[0];

    if (!page.access_token) {
      return failure(request, `Could not obtain access token for page "${page.name}". Make sure your app has pages_manage_posts permission.`);
    }

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
    console.error("[facebook/callback] Connect failed:", err);
    const message = err instanceof Error ? err.message : "Failed to connect Facebook";
    return failure(request, message);
  }

  return leave(
    request,
    "/admin/facebook?notice=Facebook%20page%20connected%20successfully&type=success&success=connected",
  );
}
