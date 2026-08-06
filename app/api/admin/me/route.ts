import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/route-auth";
import { getAuthUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const authUser = await getAuthUser();
  const settings = await getSiteSettings();

  return NextResponse.json({
    name: settings?.adminName || "Admin",
    email: settings?.adminEmail || authUser?.email || env.ADMIN_EMAIL,
    role: authUser?.role || "admin",
  });
}
