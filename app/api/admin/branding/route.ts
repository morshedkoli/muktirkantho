import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/route-auth";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const settings = await getSiteSettings();

  return NextResponse.json({
    logoUrl: settings?.logoUrl ?? null,
    logoDarkUrl: settings?.iconUrl ?? null,
  });
}
