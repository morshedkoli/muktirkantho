import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";
import { taxonomySchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/route-auth";

export async function GET() {
  const items = await prisma.upazila.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const payload = await request.json();
  const parsed = taxonomySchema.safeParse(payload);
  if (!parsed.success || !parsed.data.districtId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.upazila.create({
    data: {
      name: parsed.data.name,
      slug: makeSlug(parsed.data.name),
      districtId: parsed.data.districtId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
