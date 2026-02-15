import { NextResponse } from "next/server";
import { uploadNewsImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/route-auth";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 3 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");
  const category = (formData.get("category") as string | null) ?? "general";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 3MB)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const result = await uploadNewsImage(Buffer.from(bytes), category);

  return NextResponse.json({ secure_url: result.secureUrl, public_id: result.publicId }, { status: 201 });
}
