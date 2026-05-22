import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { Image as ImageIcon, Search, Grid3X3, List, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type MediaItem = {
  url: string;
  publicId: string;
  title: string;
  source: "post" | "ad" | "branding";
  createdAt: Date;
};

export default async function MediaPage() {
  const [posts, ads, settings] = await Promise.all([
    prisma.post.findMany({
      select: { imageUrl: true, imagePublicId: true, title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ad.findMany({
      select: { imageUrl: true, imagePublicId: true, title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findFirst(),
  ]);

  const mediaItems: MediaItem[] = [];

  posts.forEach((p) => {
    if (p.imageUrl && p.imageUrl.trim() !== "") {
      mediaItems.push({
        url: p.imageUrl,
        publicId: p.imagePublicId || "N/A",
        title: p.title,
        source: "post",
        createdAt: new Date(p.createdAt),
      });
    }
  });

  ads.forEach((a) => {
    if (a.imageUrl && a.imageUrl.trim() !== "") {
      mediaItems.push({
        url: a.imageUrl,
        publicId: a.imagePublicId || "N/A",
        title: a.title,
        source: "ad",
        createdAt: new Date(a.createdAt),
      });
    }
  });

  if (settings) {
    if (settings.logoUrl && settings.logoUrl.trim() !== "") {
      mediaItems.push({
        url: settings.logoUrl,
        publicId: settings.logoPublicId || "logo",
        title: "Primary Site Logo",
        source: "branding",
        createdAt: new Date(settings.updatedAt),
      });
    }
    if (settings.iconUrl && settings.iconUrl.trim() !== "") {
      mediaItems.push({
        url: settings.iconUrl,
        publicId: settings.iconPublicId || "icon",
        title: "Square Icon / App Touch Icon",
        source: "branding",
        createdAt: new Date(settings.updatedAt),
      });
    }
    if (settings.faviconUrl && settings.faviconUrl.trim() !== "") {
      mediaItems.push({
        url: settings.faviconUrl,
        publicId: settings.faviconPublicId || "favicon",
        title: "Browser Tab Favicon",
        source: "branding",
        createdAt: new Date(settings.updatedAt),
      });
    }
  }

  mediaItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const postImagesCount = mediaItems.filter((i) => i.source === "post").length;
  const adImagesCount = mediaItems.filter((i) => i.source === "ad").length;
  const brandingImagesCount = mediaItems.filter((i) => i.source === "branding").length;

  return (
    <AdminShell
      title="Media Library"
      description="Centralised dynamic catalog of digital assets gathered across posts, ads, and branding settings"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 flex h-10 w-10 items-center justify-center rounded-lg text-emerald-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">News Images</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{postImagesCount}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 flex h-10 w-10 items-center justify-center rounded-lg text-indigo-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">Advertisement Banner Images</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{adImagesCount}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 flex h-10 w-10 items-center justify-center rounded-lg text-purple-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">Brand & Settings Assets</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{brandingImagesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Layout Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-muted)]" />
          <input
            type="text"
            placeholder="Filter catalog..."
            className="w-full border border-[var(--ad-border)] bg-[var(--ad-card)] py-2.5 pl-10 pr-4 rounded-lg text-sm text-[var(--ad-text-primary)] outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--ad-text-secondary)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-[var(--ad-border)] bg-[var(--ad-card)] text-emerald-600 rounded hover:bg-[var(--ad-paper)] transition-colors">
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button className="p-2 border border-[var(--ad-border)] text-[var(--ad-text-muted)] rounded hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaItems.map((item, idx) => (
          <div key={idx} className="group border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden rounded-xl shadow-premium hover:border-emerald-500/20 transition-all">
            <div className="aspect-[4/3] bg-[var(--ad-paper)] relative overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Link
                  href={item.url}
                  target="_blank"
                  className="p-2 bg-[var(--ad-card)] rounded-lg text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors shadow-sm"
                >
                  <Download className="h-4 w-4" />
                </Link>
                <Link
                  href={item.url}
                  target="_blank"
                  className="p-2 bg-[var(--ad-card)] rounded-lg text-emerald-600 hover:bg-[var(--ad-paper)] transition-colors shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-3.5 space-y-1.5">
              <p className="text-[12.5px] font-bold text-[var(--ad-text-primary)] truncate font-bangla leading-normal">
                {item.title}
              </p>
              <div className="flex items-center justify-between text-[9.5px] font-mono text-[var(--ad-text-muted)] font-bold uppercase tracking-wider">
                <span className={`px-2 py-0.5 rounded ${
                  item.source === "post" ? "bg-emerald-50 text-emerald-600" :
                  item.source === "ad" ? "bg-indigo-50 text-indigo-600" :
                  "bg-purple-50 text-purple-600"
                }`}>
                  {item.source}
                </span>
                <span>Active Image</span>
              </div>
            </div>
          </div>
        ))}

        {mediaItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[var(--ad-text-muted)]">
            No media assets found in database collections.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
