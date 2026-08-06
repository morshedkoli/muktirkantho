"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/admin/toast-provider";

const toneMap: Record<string, "success" | "error" | "warning" | "info"> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

/**
 * Several taxonomy actions finish by redirecting to `?notice=…&type=…`. Those
 * params were being written and never read, so a successful save looked
 * identical to nothing happening. This surfaces them as a toast and then
 * strips them from the URL so a refresh doesn't replay the message.
 */
export function NoticeListener() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const lastShown = useRef<string | null>(null);

  const notice = searchParams.get("notice");
  const type = searchParams.get("type") ?? "success";

  useEffect(() => {
    if (!notice) {
      lastShown.current = null;
      return;
    }

    const signature = `${pathname}:${notice}:${type}`;
    if (lastShown.current === signature) return;
    lastShown.current = signature;

    showToast(notice, toneMap[type] ?? "info");

    const next = new URLSearchParams(searchParams.toString());
    next.delete("notice");
    next.delete("type");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [notice, type, pathname, router, searchParams, showToast]);

  return null;
}
