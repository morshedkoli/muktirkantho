import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { getAuthUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getSiteSettings();
    const currentEnabled = settings?.adsEnabled ?? true;
    
    // Toggle the setting
    await saveSiteSettings({
      adsEnabled: !currentEnabled,
    });
    
    // Revalidate all pages to reflect the change
    revalidatePath("/", "layout");
    
    return NextResponse.json({ 
      success: true, 
      enabled: !currentEnabled 
    });
  } catch (error) {
    console.error("Failed to toggle ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle ads" },
      { status: 500 }
    );
  }
}
