"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams.get("notice");
  const type = searchParams.get("type");

  const toneClass = useMemo(() => {
    if (type === "error") return "border-rose-200 bg-rose-50 text-rose-900";
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }, [type]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => {
      router.replace(pathname);
    }, 2600);
    return () => clearTimeout(timeout);
  }, [notice, pathname, router]);

  if (!notice) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${toneClass}`}>
        {notice}
      </div>
    </div>
  );
}
