import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/route-auth";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const settings = await getSiteSettings();

  return NextResponse.json({
    logoUrl: settings?.logoUrl ?? null,
    logoDarkUrl: settings?.iconUrl ?? null,
  });
}
