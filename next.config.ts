import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Enforce HTTPS for 1 year; include subdomains
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Tight CSP: allow scripts/styles from self + Cloudinary images + Google Fonts
    // Adjust 'unsafe-inline' for styles once CSS-in-JS is removed or nonces are added
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      // next/font self-hosts every face at build time, so no external font or
      // stylesheet origin needs to be reachable at runtime.
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      // Allow images from any HTTPS host so admins can paste arbitrary image URLs without breaking the page
      "img-src 'self' data: blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Modern equivalent of X-Frame-Options; unlike that header it also covers
      // nested frames and is the directive browsers actually honour now.
      "frame-ancestors 'self'",
      // Stop a stray http:// asset from silently downgrading the page.
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    // Allow common CMS-image hosts. Wildcards prevent SSR crashes when an
    // admin uploads to a Cloudinary subdomain (e.g. res-1.cloudinary.com) or
    // their account is configured under a custom domain.
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
    // AVIF first: on news photography it lands 20–40% smaller than WebP, and
    // Next falls back to WebP then the original for browsers that can't take it.
    formats: ["image/avif", "image/webp"],
    // Article imagery is immutable once uploaded to Cloudinary — cache the
    // optimized variants for a year instead of re-encoding every 60s.
    minimumCacheTTL: 31536000,
    // Trimmed to the widths this layout actually renders (cards, hero, sidebar
    // thumbs). Every extra entry is another variant to generate and store.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 88, 128, 256, 384],
    // SVG logos/favicons are served through next/image. SVG can carry inline
    // script, so it is only safe alongside the two settings below: the sandbox
    // CSP neutralises scripts and `attachment` stops the browser rendering an
    // uploaded SVG inline on our own origin.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
