import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.menuItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { label, href, openNewTab = false } = await req.json();
  if (!label?.trim() || !href?.trim())
    return NextResponse.json({ error: "label and href are required" }, { status: 400 });

  const agg = await prisma.menuItem.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;

  const item = await prisma.menuItem.create({
    data: { label: label.trim(), href: href.trim(), openNewTab, order, isActive: true },
  });
  return NextResponse.json(item, { status: 201 });
}
