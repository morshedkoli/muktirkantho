import Link from "next/link";
import { Images, ArrowLeft } from "lucide-react";

export default function AdminGalleryPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="rounded-lg border border-[var(--ad-border)] p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="font-editorial-mono text-[10px] tracking-[3px] uppercase text-[var(--ad-breaking)]">Modules</div>
          <h1 className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">Photo Gallery</h1>
        </div>
      </div>

      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-12 text-center">
        <Images className="mx-auto h-12 w-12 text-[var(--ad-muted)] mb-4" />
        <h2 className="font-editorial-display text-xl font-bold text-[var(--ad-text-primary)] mb-2">Coming Soon</h2>
        <p className="text-sm text-[var(--ad-text-secondary)] max-w-md mx-auto">
          The Photo Gallery module will allow you to create image galleries with captions, lightbox viewing, and slideshow functionality.
        </p>
      </div>
    </div>
  );
}
