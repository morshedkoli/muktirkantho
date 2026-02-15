import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/route-auth";
import { getAuthUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const authUser = await getAuthUser();
  const settings = await getSiteSettings();

  return NextResponse.json({
    name: settings?.adminName || "Admin",
    email: settings?.adminEmail || authUser?.email || env.ADMIN_EMAIL,
    role: authUser?.role || "admin",
  });
}
