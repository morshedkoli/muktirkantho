/**
 * Graph API error classification.
 *
 * Deliberately free of imports so the rules can be unit-tested without dragging
 * in Prisma or site settings — and because "is this worth retrying?" is a
 * decision, not an I/O concern.
 */

export interface FacebookErrorDetail {
  code?: number;
  error_subcode?: number;
  type?: string;
  message?: string;
}

/** Codes meaning the token/permission is bad — a human must reconnect. */
const AUTH_CODES = new Set([
  190, // invalid or expired access token
  102, // session expired
  10, // permission denied for this app
]);

/** Codes that clear on their own: platform hiccups and throttling. */
const TRANSIENT_CODES = new Set([
  1, // unknown/transient
  2, // service temporarily unavailable
  4, // application request limit reached
  17, // user request limit reached
  32, // page request limit reached
  613, // calls to this api have exceeded the rate limit
]);

export function isAuthErrorCode(code: number | undefined): boolean {
  if (code === undefined) return false;
  // 200–299 are permission errors: the token is valid but the app lacks (or
  // lost) the permission, which also needs someone to re-grant it.
  return AUTH_CODES.has(code) || (code >= 200 && code <= 299);
}

export function isTransientErrorCode(code: number | undefined, httpStatus?: number): boolean {
  if (code !== undefined) return TRANSIENT_CODES.has(code);
  // No parseable error body on a 5xx: Facebook returned nothing actionable, so
  // the failure is the platform's rather than the payload's.
  return httpStatus !== undefined && httpStatus >= 500;
}

/**
 * A Graph API error carrying enough detail to decide what to do next.
 *
 * The distinction drives the share queue: an expired token fails identically
 * forever until someone reconnects, while a rate limit clears on its own.
 * Retrying the first is noise; retrying the second is the whole point.
 */
export class FacebookApiError extends Error {
  readonly code: number | undefined;
  readonly subcode: number | undefined;
  readonly type: string | undefined;
  /** Re-authentication required — retrying without reconnecting cannot help. */
  readonly isAuthError: boolean;
  /** Transient — a later retry may succeed. */
  readonly isTransient: boolean;

  constructor(message: string, detail?: FacebookErrorDetail, httpStatus?: number) {
    super(message);
    this.name = "FacebookApiError";
    this.code = detail?.code;
    this.subcode = detail?.error_subcode;
    this.type = detail?.type;
    this.isAuthError = isAuthErrorCode(detail?.code);
    this.isTransient = isTransientErrorCode(detail?.code, httpStatus);
  }
}
