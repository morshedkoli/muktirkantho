
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const posts = await prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { title: true, slug: true, status: true, id: true }
    });

    return NextResponse.json(posts);
}
