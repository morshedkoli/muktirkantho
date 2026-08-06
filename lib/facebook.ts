// Facebook Graph API utilities
import { getSiteSettings } from "@/lib/site-settings";
import { FacebookApiError, type FacebookErrorDetail } from "@/lib/facebook-errors";

export { FacebookApiError } from "@/lib/facebook-errors";

const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

/** httpOnly cookie holding the OAuth `state` nonce between connect and callback. */
export const FACEBOOK_OAUTH_STATE_COOKIE = "mk_fb_oauth_state";
export const FACEBOOK_OAUTH_SCOPE = "pages_manage_posts,pages_read_engagement,pages_show_list";
export const FACEBOOK_OAUTH_DIALOG_URL = `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth`;

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

/** Parse a Graph API error body into a typed error. */
async function toApiError(response: Response, fallback: string): Promise<FacebookApiError> {
  let detail: FacebookErrorDetail | undefined;
  try {
    const body = await response.json();
    detail = body?.error;
  } catch {
    // Non-JSON body (gateway HTML, empty 502) — status alone has to carry it.
  }
  return new FacebookApiError(
    detail?.message || `${fallback} (HTTP ${response.status})`,
    detail,
    response.status,
  );
}

async function getFacebookCredentials(): Promise<{ appId: string; appSecret: string } | null> {
  const settings = await getSiteSettings();
  if (!settings?.facebookAppId || !settings?.facebookAppSecret) {
    return null;
  }
  return {
    appId: settings.facebookAppId,
    appSecret: settings.facebookAppSecret,
  };
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<string> {
  const credentials = await getFacebookCredentials();
  if (!credentials) {
    throw new Error("Facebook App credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: credentials.appId,
    client_secret: credentials.appSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    `${FACEBOOK_BASE_URL}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    throw await toApiError(response, "Failed to exchange code for token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Trade a short-lived user token for a long-lived one.
 *
 * This step is not optional for auto-posting. The token returned by the OAuth
 * code exchange lasts a couple of hours, and a page token derived from it
 * inherits that lifetime — so a connection made today stops publishing before
 * tomorrow, silently, with nothing in the UI to explain why.
 *
 * Page tokens derived from a LONG-LIVED user token do not expire at all, which
 * is the property this integration actually needs.
 * See: developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 */
export async function exchangeForLongLivedUserToken(shortLivedToken: string): Promise<string> {
  const credentials = await getFacebookCredentials();
  if (!credentials) {
    throw new Error("Facebook App credentials not configured");
  }

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: credentials.appId,
    client_secret: credentials.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${FACEBOOK_BASE_URL}/oauth/access_token?${params.toString()}`);
  if (!response.ok) {
    throw await toApiError(response, "Failed to obtain a long-lived token");
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Long-lived token exchange returned no token");
  }
  return data.access_token;
}

export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  const response = await fetch(
    `${FACEBOOK_BASE_URL}/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,category,picture{url}`
  );

  if (!response.ok) {
    throw await toApiError(response, "Failed to fetch pages");
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Confirm a stored page token still works, so the admin screen can say
 * "reconnect" instead of leaving a dead connection looking healthy.
 */
export async function verifyPageToken(
  pageId: string,
  pageAccessToken: string,
): Promise<{ ok: true } | { ok: false; reason: string; needsReconnect: boolean }> {
  try {
    const response = await fetch(
      `${FACEBOOK_BASE_URL}/${pageId}?fields=id,name&access_token=${encodeURIComponent(pageAccessToken)}`,
    );
    if (response.ok) return { ok: true };
    const error = await toApiError(response, "Page token check failed");
    return { ok: false, reason: error.message, needsReconnect: error.isAuthError };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Page token check failed",
      needsReconnect: false,
    };
  }
}

export async function postToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  message: string,
  link?: string,
  imageUrl?: string
): Promise<FacebookPostResponse> {
  let url: string;
  let body: URLSearchParams;

  if (imageUrl) {
    // Post with photo
    url = `${FACEBOOK_BASE_URL}/${pageId}/photos`;
    body = new URLSearchParams({
      url: imageUrl,
      caption: message,
      access_token: pageAccessToken,
    });
    if (link) {
      body.append("link", link);
    }
  } else if (link) {
    // Post with link
    url = `${FACEBOOK_BASE_URL}/${pageId}/feed`;
    body = new URLSearchParams({
      message,
      link,
      access_token: pageAccessToken,
    });
  } else {
    // Text-only post
    url = `${FACEBOOK_BASE_URL}/${pageId}/feed`;
    body = new URLSearchParams({
      message,
      access_token: pageAccessToken,
    });
  }

  const response = await fetch(url, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to post to Facebook");
  }

  return response.json();
}

/**
 * Public permalink for a created post.
 *
 * `/photos` returns a bare media id while `/feed` returns `{pageId}_{postId}`;
 * facebook.com/{id} resolves both, so the id is used as-is rather than
 * guessing at a prettier URL shape.
 */
export function getFacebookPermalink(response: FacebookPostResponse): string {
  return `https://www.facebook.com/${response.post_id ?? response.id}`;
}

// Format news post for Facebook
export function formatFacebookPost(
  title: string,
  excerpt: string,
  category: string,
  url: string,
  district?: string
): string {
  const location = district ? `📍 ${district}` : "";
  const categoryEmoji = getCategoryEmoji(category);
  
  return `${categoryEmoji} ${title}

${excerpt}

${location}

📰 Read more: ${url}

#${category.toLowerCase().replace(/\s+/g, "")} #muktirkantho #news #bangladesh`;
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    politics: "🏛️",
    sports: "⚽",
    economy: "📈",
    education: "📚",
    entertainment: "🎬",
    health: "🏥",
    technology: "💻",
    international: "🌍",
  };
  
  return emojiMap[category.toLowerCase()] || "📰";
}

export async function isFacebookConfigured(): Promise<boolean> {
  const credentials = await getFacebookCredentials();
  return !!credentials;
}

export async function getFacebookAppId(): Promise<string | null> {
  const settings = await getSiteSettings();
  return settings?.facebookAppId ?? null;
}
