import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/route-auth";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const settings = await getSiteSettings();
    const enabled = !(settings?.adsEnabled ?? true);

    await saveSiteSettings({ adsEnabled: enabled });

    // Revalidate all pages to reflect the change
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error("Failed to toggle ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle ads" },
      { status: 500 }
    );
  }
}
