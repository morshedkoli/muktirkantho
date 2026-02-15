// Facebook Graph API utilities
import { getSiteSettings } from "@/lib/site-settings";

const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

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

export async function getFacebookLoginUrl(redirectUri: string): Promise<string> {
  const credentials = await getFacebookCredentials();
  if (!credentials) {
    throw new Error("Facebook App credentials not configured. Please set them in the admin panel.");
  }

  const scope = "pages_manage_posts,pages_read_engagement,pages_show_list";
  const state = generateState();
  
  const params = new URLSearchParams({
    client_id: credentials.appId,
    redirect_uri: redirectUri,
    scope,
    response_type: "code",
    state,
  });

  return `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?${params.toString()}`;
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
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to exchange code for token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  const response = await fetch(
    `${FACEBOOK_BASE_URL}/me/accounts?access_token=${accessToken}&fields=id,name,category,picture{url}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch pages");
  }

  const data = await response.json();
  return data.data || [];
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
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to post to Facebook");
  }

  return response.json();
}

export async function verifyPageToken(
  pageId: string,
  pageAccessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${FACEBOOK_BASE_URL}/${pageId}?access_token=${pageAccessToken}&fields=id,name`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function disconnectFacebookPage(
  pageAccessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${FACEBOOK_BASE_URL}/me/permissions?access_token=${pageAccessToken}`,
      { method: "DELETE" }
    );
    return response.ok;
  } catch {
    return false;
  }
}

function generateState(): string {
  return Buffer.from(Math.random().toString()).toString("base64").substring(0, 32);
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
