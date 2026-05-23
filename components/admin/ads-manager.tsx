"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { createAdAction, deleteAdAction, toggleAdStatusAction } from "@/app/(admin)/admin/actions";
import { AD_PLACEMENT_OPTIONS, AD_PLACEMENTS, getAdPlacementMeta, type AdPlacement } from "@/lib/ads";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

type AdItem = {
  id: string;
  title: string;
  placement: string;
  imageUrl: string;
  imagePublicId: string;
  targetUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

type AdsManagerProps = {
  ads: AdItem[];
  adsEnabled: boolean;
};

const initialState: AdminActionState = { status: "idle" };

export function AdsManager({ ads, adsEnabled }: AdsManagerProps) {
  const router = useRouter();
  const [isTogglingGlobal, startToggleTransition] = useTransition();
  const [managingPlacement, setManagingPlacement] = useState<string | null>(null);

  const handleGlobalToggle = () => {
    startToggleTransition(async () => {
      try {
        await fetch("/api/admin/toggle-ads", { method: "POST" });
        router.refresh();
      } catch {
        // no-op
      }
    });
  };

  // Statistics
  const totalAds = ads.length;
  const activeAds = ads.filter((ad) => ad.isActive).length;
  const inactiveAds = totalAds - activeAds;

  // Group ads by placement
  const adsByPlacement = AD_PLACEMENT_OPTIONS.map((option) => ({
    ...option,
    ads: ads.filter((ad) => ad.placement === option.value),
    activeCount: ads.filter((ad) => ad.placement === option.value && ad.isActive).length,
  }));

  const managingPlacementData = managingPlacement
    ? adsByPlacement.find((p) => p.value === managingPlacement) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* Global Ads Toggle */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 sm:p-6 shadow-[var(--ad-shadow)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[var(--ad-background)] p-3">
              <Megaphone
                className={cn(
                  "h-6 w-6",
                  adsEnabled ? "text-[var(--ad-success)]" : "text-[var(--ad-text-secondary)]",
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--ad-text-primary)]">
                বিজ্ঞাপন সিস্টেম {adsEnabled ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </h3>
              <p className="text-sm text-[var(--ad-text-secondary)]">
                {adsEnabled
                  ? "বিজ্ঞাপনগুলো ওয়েবসাইটে প্রদর্শিত হচ্ছে"
                  : "সব বিজ্ঞাপন ওয়েবসাইট থেকে লুকানো আছে"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGlobalToggle}
            disabled={isTogglingGlobal}
            className="p-2 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {adsEnabled ? (
              <ToggleRight className="h-10 w-10 text-[var(--ad-success)]" />
            ) : (
              <ToggleLeft className="h-10 w-10 text-[var(--ad-text-secondary)]" />
            )}
          </button>
        </div>

        {!adsEnabled && (
          <div className="mt-4 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] p-3">
            <p className="text-sm text-[var(--ad-text-secondary)]">
              <strong>নোট:</strong> সকল বিজ্ঞাপন স্লট বর্তমানে ওয়েবসাইট থেকে লুকানো। সক্রিয় করতে উপরের বোতামে ক্লিক করুন।
            </p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="মোট বিজ্ঞাপন"
          value={totalAds}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="সক্রিয় বিজ্ঞাপন"
          value={activeAds}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="নিষ্ক্রিয় বিজ্ঞাপন"
          value={inactiveAds}
          icon={<XCircle className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Placement Grid */}
      <div>
        <h3 className="text-base font-semibold text-[var(--ad-text-primary)] mb-3">
          বিজ্ঞাপন স্লট
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {adsByPlacement.map((placement) => {
            const meta = getAdPlacementMeta(placement.value);
            const firstActiveAd = placement.ads.find((ad) => ad.isActive);

            return (
              <PlacementCard
                key={placement.value}
                meta={meta}
                activeCount={placement.activeCount}
                totalCount={placement.ads.length}
                firstActiveAd={firstActiveAd}
                onManage={() => setManagingPlacement(placement.value)}
              />
            );
          })}
        </div>
      </div>

      {/* Placement Management Panel (slide-over style) */}
      {managingPlacement && managingPlacementData && (
        <PlacementPanel
          placement={managingPlacementData}
          onClose={() => setManagingPlacement(null)}
        />
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    blue: "text-sky-600",
    emerald: "text-[var(--ad-success)]",
    amber: "text-[var(--ad-warning)]",
    rose: "text-[var(--ad-error)]",
  };

  return (
    <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--ad-text-secondary)]">{title}</p>
          <p className={cn("mt-1 text-3xl font-bold", toneClasses[color])}>{value}</p>
        </div>
        <div className={cn("rounded-lg p-3 bg-[var(--ad-background)]", toneClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Placement Card ────────────────────────────────────────────────────────────

function PlacementCard({
  meta,
  activeCount,
  totalCount,
  firstActiveAd,
  onManage,
}: {
  meta: ReturnType<typeof getAdPlacementMeta>;
  activeCount: number;
  totalCount: number;
  firstActiveAd: AdItem | undefined;
  onManage: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 shadow-[var(--ad-shadow)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[var(--ad-text-primary)] text-sm">{meta.label}</h4>
          <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">{meta.dimensions}</p>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            activeCount > 0
              ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
              : "bg-[var(--ad-paper-2)] text-[var(--ad-muted)]",
          )}
        >
          {activeCount} সক্রিয়
        </span>
      </div>

      {/* Preview thumbnail or empty placeholder */}
      {firstActiveAd ? (
        <div className="relative w-full h-20 rounded-lg overflow-hidden border border-[var(--ad-border)] bg-[var(--ad-background)]">
          <Image
            src={firstActiveAd.imageUrl}
            alt={firstActiveAd.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-center gap-1.5",
            "border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50",
            "h-20",
          )}
        >
          <Megaphone className="h-5 w-5 text-zinc-300" />
          <p className="text-xs text-zinc-300">কোনো সক্রিয় বিজ্ঞাপন নেই</p>
        </div>
      )}

      {/* Description + footer */}
      <p className="text-xs text-[var(--ad-text-secondary)] leading-relaxed">
        {meta.description}
      </p>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[var(--ad-muted)]">
          মোট: {totalCount}
        </span>
        <button
          type="button"
          onClick={onManage}
          className="flex items-center gap-1 text-xs font-medium text-[var(--ad-primary)] hover:underline"
        >
          পরিচালনা করুন
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Placement Panel (modal) ──────────────────────────────────────────────────

function PlacementPanel({
  placement,
  onClose,
}: {
  placement: {
    value: string;
    label: string;
    ads: AdItem[];
    activeCount: number;
  };
  onClose: () => void;
}) {
  const meta = getAdPlacementMeta(placement.value);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-2xl">
        {/* Panel header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--ad-border)] bg-[var(--ad-card)] px-5 py-4">
          <div>
            <h3 className="font-semibold text-[var(--ad-text-primary)]">{meta.label}</h3>
            <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">
              {meta.dimensions} · {meta.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Existing ads for this placement */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--ad-text-primary)] mb-3">
              বিদ্যমান বিজ্ঞাপনসমূহ
            </h4>
            {placement.ads.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-[var(--ad-border)] p-6 text-center">
                <Megaphone className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-sm text-[var(--ad-text-secondary)]">
                  এই স্লটে কোনো বিজ্ঞাপন নেই।
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--ad-border)] overflow-hidden divide-y divide-[var(--ad-border)]">
                {placement.ads.map((ad) => (
                  <AdListItem key={ad.id} ad={ad} />
                ))}
              </div>
            )}
          </div>

          {/* Upload new ad form for this placement */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--ad-text-primary)] mb-3">
              নতুন বিজ্ঞাপন যোগ করুন
            </h4>
            <CreateAdForm defaultPlacement={placement.value as AdPlacement} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Ad Form ────────────────────────────────────────────────────────────

function CreateAdForm({ defaultPlacement }: { defaultPlacement: AdPlacement }) {
  const [state, formAction, pending] = useActionState(createAdAction, initialState);
  const [uploadNotice, setUploadNotice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>(defaultPlacement);

  const meta = getAdPlacementMeta(placement);

  const onUpload = async (file: File) => {
    setUploadNotice("");
    const data = new FormData();
    data.append("file", file);
    data.append("category", "ads");

    try {
      const response = await fetch("/api/upload", { method: "POST", body: data });
      const payload = await response.json();

      if (!response.ok) {
        setUploadNotice(payload.error || "Upload failed.");
        return;
      }

      setImageUrl(payload.secure_url);
      setImagePublicId(payload.public_id);
      setUploadNotice("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch {
      setUploadNotice("আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-background)] p-4 space-y-4">
        {state.status === "error" && state.message && (
          <div className="rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-4 py-3 text-sm text-[var(--ad-error)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}

        {uploadNotice && (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm flex items-center gap-2",
              uploadNotice.includes("সফল")
                ? "border-[var(--ad-success)]/20 bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                : "border-[var(--ad-warning)]/20 bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]",
            )}
          >
            {uploadNotice.includes("সফল") ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {uploadNotice}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1.5">
            বিজ্ঞাপনের শিরোনাম <span className="text-[var(--ad-error)]">*</span>
          </label>
          <input
            name="title"
            type="text"
            placeholder="যেমন: গ্রীষ্মকালীন অফার ২০২৬"
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-3 py-2 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
            required
          />
        </div>

        {/* Placement */}
        <div>
          <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1.5">
            বিজ্ঞাপন স্লট <span className="text-[var(--ad-error)]">*</span>
          </label>
          <select
            name="placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value as AdPlacement)}
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-3 py-2 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
          >
            {AD_PLACEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[var(--ad-text-secondary)]">
            {meta.description} · {meta.dimensions}
          </p>
        </div>

        {/* Target URL */}
        <div>
          <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1.5">
            টার্গেট URL
          </label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
            <input
              name="targetUrl"
              type="url"
              placeholder="https://example.com"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] pl-10 pr-3 py-2 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1.5">
            বিজ্ঞাপনের ছবি <span className="text-[var(--ad-error)]">*</span>
          </label>
          <div className="border-2 border-dashed border-[var(--ad-border)] rounded-lg p-4 text-center hover:border-[var(--ad-primary)] transition-colors">
            <ImageIcon className="h-6 w-6 mx-auto text-[var(--ad-text-secondary)] mb-2" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
              }}
              className="block w-full text-xs text-[var(--ad-text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--ad-primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white file:cursor-pointer hover:file:bg-[var(--ad-primary-hover)]"
            />
            <p className="mt-1.5 text-xs text-[var(--ad-text-secondary)]">
              প্রস্তাবিত: {meta.dimensions} · সর্বোচ্চ ২MB · JPG, PNG, WebP
            </p>
          </div>

          {/* Uploaded preview */}
          {imageUrl && (
            <div className="mt-2 relative h-20 w-full rounded-lg overflow-hidden border border-[var(--ad-border)]">
              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--ad-card)] border border-[var(--ad-border)]">
          <input
            type="checkbox"
            name="isActive"
            id="isActiveCreate"
            defaultChecked
            className="h-4 w-4 rounded border-[var(--ad-border)] text-[var(--ad-primary)] focus:ring-[var(--ad-primary)]"
          />
          <label htmlFor="isActiveCreate" className="text-sm font-medium text-[var(--ad-text-primary)] cursor-pointer">
            তাৎক্ষণিকভাবে সক্রিয় করুন
          </label>
        </div>

        <input type="hidden" name="imageUrl" value={imageUrl} />
        <input type="hidden" name="imagePublicId" value={imagePublicId} />

        <button
          type="submit"
          disabled={pending || !imageUrl}
          className="w-full rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--ad-primary)]/20"
        >
          {pending ? "তৈরি হচ্ছে..." : "বিজ্ঞাপন তৈরি করুন"}
        </button>
      </div>
    </form>
  );
}

// ─── Ad List Item ─────────────────────────────────────────────────────────────

function AdListItem({ ad }: { ad: AdItem }) {
  const meta = getAdPlacementMeta(ad.placement);

  return (
    <div className="p-4 hover:bg-[var(--ad-background)]/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-full sm:w-36 h-20 rounded-lg overflow-hidden border border-[var(--ad-border)] bg-[var(--ad-background)]">
          <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-[var(--ad-text-primary)] truncate text-sm">
                {ad.title}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--ad-text-secondary)]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {meta.label}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ad.createdAt).toLocaleDateString()}
                </span>
              </div>
              {ad.targetUrl && (
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--ad-primary)] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ad.targetUrl.length > 40 ? ad.targetUrl.substring(0, 40) + "…" : ad.targetUrl}
                </a>
              )}
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                ad.isActive
                  ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                  : "bg-[var(--ad-paper-2)] text-[var(--ad-muted)]",
              )}
            >
              {ad.isActive ? (
                <><Eye className="h-3 w-3" /> সক্রিয়</>
              ) : (
                <><EyeOff className="h-3 w-3" /> নিষ্ক্রিয়</>
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <form action={toggleAdStatusAction.bind(null, ad.id, !ad.isActive)}>
              <button
                type="submit"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  ad.isActive
                    ? "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)] hover:bg-[var(--ad-warning)]/20 border border-[var(--ad-warning)]/20"
                    : "bg-[var(--ad-success)]/10 text-[var(--ad-success)] hover:bg-[var(--ad-success)]/20 border border-[var(--ad-success)]/20",
                )}
              >
                {ad.isActive ? (
                  <><EyeOff className="h-3.5 w-3.5" /> বন্ধ করুন</>
                ) : (
                  <><Eye className="h-3.5 w-3.5" /> সক্রিয় করুন</>
                )}
              </button>
            </form>
            <form action={deleteAdAction.bind(null, ad.id)}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--ad-error)]/10 text-[var(--ad-error)] hover:bg-[var(--ad-error)]/20 border border-[var(--ad-error)]/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                মুছুন
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
