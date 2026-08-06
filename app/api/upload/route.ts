import { NextResponse } from "next/server";
import { uploadNewsImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/route-auth";
import { makeSlug } from "@/lib/utils";

const MAX_SIZE_BYTES = 3 * 1024 * 1024;
const DEFAULT_FOLDER = "general";

/**
 * `file.type` is attacker-controlled, so the declared MIME type is only a first
 * filter — the real check is the file's magic bytes below.
 */
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Detect the true image format from its leading bytes. */
function detectImageType(bytes: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 8 && PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    return "image/png";
  }
  // RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 3MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Re-check the size against the actual payload: `file.size` is metadata and
  // can disagree with the bytes we were handed.
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 3MB)" }, { status: 400 });
  }

  if (detectImageType(buffer) !== file.type) {
    return NextResponse.json({ error: "File content is not a supported image" }, { status: 400 });
  }

  // The category becomes a Cloudinary folder segment — slugify it so a value
  // like `../../` can't escape the `news/` prefix.
  const rawCategory = formData.get("category");
  const folder = (typeof rawCategory === "string" ? makeSlug(rawCategory) : "") || DEFAULT_FOLDER;

  try {
    const result = await uploadNewsImage(buffer, folder);
    return NextResponse.json(
      { secure_url: result.secureUrl, public_id: result.publicId },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/upload] Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }
}
