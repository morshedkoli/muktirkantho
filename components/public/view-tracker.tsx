"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ViewTrackerProps {
  /** Present on an article page; its absence makes this a plain page view. */
  postId?: string;
}

/**
 * Fires the traffic beacon once the page is on screen.
 *
 * Client-side on purpose. The article route is cached (`revalidate = 60`), so
 * counting during render would miss every cache hit; and a beacon that needs
 * JavaScript to run excludes the crawler traffic that would otherwise be most
 * of the numbers.
 */
export function ViewTracker({ postId }: ViewTrackerProps) {
  const pathname = usePathname();
  // React runs effects twice in development StrictMode, and a counter that
  // double-fires there teaches you the wrong thing about your traffic.
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    // The article route mounts its own tracker carrying the post id, and that
    // beacon already records the page view. The site-wide tracker in the
    // layout renders there too, so without this one page load would count as
    // two. `/news` itself is a listing and still counts here.
    const isArticleRoute = !postId && /^\/news\/.+/.test(pathname);
    if (isArticleRoute) return;

    const key = postId ? `read:${postId}` : `view:${pathname}`;
    if (sentFor.current === key) return;
    sentFor.current = key;

    // Per-session dedupe: a reader who refreshes an article, or navigates back
    // to it, is still one read. Cleared when the tab closes, so a genuine
    // return visit tomorrow counts again.
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode or storage disabled — fall through and count it. An
      // occasional double count beats losing the reader entirely.
    }

    // The referrer is only meaningful on the first page of a visit — after
    // that it is the previous article on this same site, which the server
    // discards as navigation rather than acquisition.
    const body = JSON.stringify({
      ...(postId ? { postId } : {}),
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });

    // `keepalive` so the request survives the reader clicking away immediately,
    // which is exactly when a bounce would otherwise go uncounted.
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Offline, blocked by an extension, or the endpoint is down. A missing
      // count is not worth a console error in a reader's browser.
    });
  }, [postId, pathname]);

  return null;
}
