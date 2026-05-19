import { getSiteSettings } from "@/lib/site-settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({
      logoUrl: settings?.logoUrl ?? null,
      darkLogoUrl: settings?.iconUrl ?? null,
      logoHeight: settings?.logoHeight ?? null,
    });
  } catch {
    return NextResponse.json({ logoUrl: null, darkLogoUrl: null, logoHeight: null });
  }
}
