"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { createAdAction, deleteAdAction, toggleAdStatusAction } from "@/app/(admin)/admin/actions";
import { AD_PLACEMENT_OPTIONS, AD_PLACEMENTS, type AdPlacement } from "@/lib/ads";
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
  LayoutGrid,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Megaphone
} from "lucide-react";

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

const placementConfigs: Record<string, { 
  label: string; 
  size: string; 
  aspectRatio: string;
  description: string;
  icon: React.ReactNode;
}> = {
  [AD_PLACEMENTS.SIDEBAR_PRIMARY]: {
    label: "Sidebar Primary",
    size: "300 x 250 px",
    aspectRatio: "aspect-[6/5]",
    description: "Main sidebar ad space on article pages",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  [AD_PLACEMENTS.HOMEPAGE_BANNER]: {
    label: "Homepage Banner",
    size: "1200 x 220 px",
    aspectRatio: "aspect-[40/7]",
    description: "Large banner below hero section on homepage",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  [AD_PLACEMENTS.ARTICLE_INLINE]: {
    label: "Article Inline",
    size: "970 x 250 px",
    aspectRatio: "aspect-[4/1]",
    description: "Ad within article content",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  [AD_PLACEMENTS.FOOTER_STRIP]: {
    label: "Footer Strip",
    size: "1200 x 160 px",
    aspectRatio: "aspect-[15/2]",
    description: "Wide ad strip in footer area",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
};

export function AdsManager({ ads, adsEnabled }: AdsManagerProps) {
  const router = useRouter();
  const [isTogglingGlobal, startToggleTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "manage">("overview");
  const [selectedPlacement, setSelectedPlacement] = useState<string>("all");

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
  const activeAds = ads.filter(ad => ad.isActive).length;
  const inactiveAds = totalAds - activeAds;
  
  // Group ads by placement
  const adsByPlacement = AD_PLACEMENT_OPTIONS.map(option => ({
    ...option,
    ads: ads.filter(ad => ad.placement === option.value),
    activeCount: ads.filter(ad => ad.placement === option.value && ad.isActive).length,
  }));

  const filteredAds = selectedPlacement === "all" 
    ? ads 
    : ads.filter(ad => ad.placement === selectedPlacement);

  return (
    <div className="space-y-6">
      {/* Global Ads Toggle */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[var(--ad-background)] p-3">
              <Megaphone className={`h-6 w-6 ${adsEnabled ? "text-emerald-600" : "text-[var(--ad-text-secondary)]"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--ad-text-primary)]">
                Ads System {adsEnabled ? "Enabled" : "Disabled"}
              </h3>
              <p className="text-sm text-[var(--ad-text-secondary)]">
                {adsEnabled 
                  ? "Ads are being displayed on the website" 
                  : "All ads are hidden from the website"}
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
              <ToggleRight className="h-10 w-10 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-10 w-10 text-[var(--ad-text-secondary)]" />
            )}
          </button>
        </div>
        
        {!adsEnabled && (
          <div className="mt-4 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] p-3">
            <p className="text-sm text-[var(--ad-text-secondary)]">
              <strong>Note:</strong> All ad placeholders are currently hidden from the website. 
              Enable ads to show placeholders and active ads.
            </p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          title="Total Ads" 
          value={totalAds} 
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard 
          title="Active Ads" 
          value={activeAds} 
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard 
          title="Inactive Ads" 
          value={inactiveAds} 
          icon={<XCircle className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--ad-border)]">
        <div className="flex gap-1">
          <TabButton 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")}
            icon={<BarChart3 className="h-4 w-4" />}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === "create"} 
            onClick={() => setActiveTab("create")}
            icon={<Plus className="h-4 w-4" />}
          >
            Create New
          </TabButton>
          <TabButton 
            active={activeTab === "manage"} 
            onClick={() => setActiveTab("manage")}
            icon={<Settings className="h-4 w-4" />}
          >
            Manage Ads
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab adsByPlacement={adsByPlacement} />
      )}

      {activeTab === "create" && (
        <CreateAdTab />
      )}

      {activeTab === "manage" && (
        <ManageAdsTab 
          ads={filteredAds}
          placements={adsByPlacement}
          selectedPlacement={selectedPlacement}
          onPlacementChange={setSelectedPlacement}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    blue: "text-sky-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };

  return (
    <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--ad-text-secondary)]">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${toneClasses[color]}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${toneClasses[color]} bg-[var(--ad-background)]`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  children, 
  active, 
  onClick, 
  icon 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        active 
          ? "border-[var(--ad-primary)] text-[var(--ad-primary)]" 
          : "border-transparent text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function OverviewTab({ adsByPlacement }: { adsByPlacement: Array<{
  value: string;
  label: string;
  ads: AdItem[];
  activeCount: number;
}> }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
          Ad Placement Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {adsByPlacement.map((placement) => {
            const config = placementConfigs[placement.value];
            const totalInPlacement = placement.ads.length;
            const activeInPlacement = placement.activeCount;
            
            return (
              <div 
                key={placement.value}
                className="rounded-lg border border-[var(--ad-border)] p-4 hover:border-[var(--ad-primary)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--ad-background)] text-[var(--ad-primary)]">
                      {config?.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--ad-text-primary)]">
                        {config?.label || placement.label}
                      </h4>
                      <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">
                        {config?.size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activeInPlacement > 0 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {activeInPlacement} active
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[var(--ad-text-secondary)] mt-3">
                  {config?.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--ad-text-secondary)]">
                  <span>Total: {totalInPlacement}</span>
                  <span>Active: {activeInPlacement}</span>
                  <span>Inactive: {totalInPlacement - activeInPlacement}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h4 className="font-semibold text-blue-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Ad Management Tips
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Each placement can have multiple ads, but only one will be shown at a time</li>
          <li>• Active ads are rotated randomly when multiple exist in the same placement</li>
          <li>• Use high-quality images for better engagement</li>
          <li>• Include target URLs to track ad performance</li>
        </ul>
      </div>
    </div>
  );
}

function CreateAdTab() {
  const [state, formAction, pending] = useActionState(createAdAction, initialState);
  const [uploadNotice, setUploadNotice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>(AD_PLACEMENTS.SIDEBAR_PRIMARY);
  const [previewMode, setPreviewMode] = useState(false);

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
      setUploadNotice("Image uploaded successfully!");
    } catch {
      setUploadNotice("Upload failed. Please try again.");
    }
  };

  const config = placementConfigs[placement];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <form action={formAction} className="space-y-5">
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-5">
            Create New Advertisement
          </h3>

          {state.status === "error" && state.message && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.message}
            </div>
          )}

          {uploadNotice && (
            <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
              uploadNotice.includes("success") 
                ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}>
              {uploadNotice.includes("success") ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {uploadNotice}
            </div>
          )}

          <div className="space-y-4">
            {/* Ad Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
                Ad Title <span className="text-rose-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                placeholder="e.g., Summer Sale 2024"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
                required
              />
              <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">
                Internal name to identify this ad
              </p>
            </div>

            {/* Placement Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
                Ad Placement <span className="text-rose-500">*</span>
              </label>
              <select
                name="placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
              >
                {AD_PLACEMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 p-3 rounded-lg bg-[var(--ad-background)] border border-[var(--ad-border)]">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-[var(--ad-text-primary)]">Size:</span>
                  <span className="text-[var(--ad-text-secondary)]">{config?.size}</span>
                </div>
                <p className="text-xs text-[var(--ad-text-secondary)] mt-1">
                  {config?.description}
                </p>
              </div>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
                Target URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
                <input
                  name="targetUrl"
                  type="url"
                  placeholder="https://example.com/landing-page"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] pl-10 pr-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">
                Where users will go when they click the ad (optional)
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
                Ad Image <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-[var(--ad-border)] rounded-lg p-6 text-center hover:border-[var(--ad-primary)] transition-colors">
                <ImageIcon className="h-8 w-8 mx-auto text-[var(--ad-text-secondary)] mb-2" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUpload(file);
                  }}
                  className="block w-full text-xs text-[var(--ad-text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--ad-primary)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer hover:file:bg-[var(--ad-primary-hover)]"
                />
                <p className="mt-2 text-xs text-[var(--ad-text-secondary)]">
                  Recommended: {config?.size} • Max 2MB • JPG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--ad-background)] border border-[var(--ad-border)]">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--ad-border)] text-[var(--ad-primary)] focus:ring-[var(--ad-primary)]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-[var(--ad-text-primary)] cursor-pointer">
                Activate ad immediately
              </label>
            </div>

            <input type="hidden" name="imageUrl" value={imageUrl} />
            <input type="hidden" name="imagePublicId" value={imagePublicId} />

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={pending || !imageUrl}
                className="flex-1 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--ad-primary)]/20"
              >
                {pending ? "Creating..." : "Create Ad"}
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                disabled={!imageUrl}
                className="rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-5 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-card)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {previewMode ? "Hide Preview" : "Preview"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
            Preview
          </h3>
          
          {imageUrl ? (
            <div className="space-y-4">
              <div className={`relative overflow-hidden rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] ${config?.aspectRatio || "aspect-video"}`}>
                <Image
                  src={imageUrl}
                  alt="Ad Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-sm text-[var(--ad-text-secondary)]">
                <p><span className="font-medium">Size:</span> {config?.size}</p>
                <p><span className="font-medium">Placement:</span> {config?.label}</p>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--ad-border)] bg-[var(--ad-background)] ${config?.aspectRatio || "aspect-video"}`}>
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-[var(--ad-text-secondary)] mb-2" />
                <p className="text-sm text-[var(--ad-text-secondary)]">
                  Upload an image to see preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Placement Preview */}
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h4 className="font-semibold text-[var(--ad-text-primary)] mb-3">
            Placement Preview
          </h4>
          <div className={`relative overflow-hidden rounded-lg border border-[var(--ad-border)] bg-gray-100 ${config?.aspectRatio || "aspect-video"}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {config?.label}
                </span>
                <p className="text-xs text-gray-400 mt-1">{config?.size}</p>
              </div>
            </div>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Ad Preview"
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageAdsTab({ 
  ads, 
  placements, 
  selectedPlacement, 
  onPlacementChange 
}: { 
  ads: AdItem[];
  placements: Array<{
    value: string;
    label: string;
    ads: AdItem[];
    activeCount: number;
  }>;
  selectedPlacement: string;
  onPlacementChange: (placement: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--ad-text-primary)]">Filter by placement:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onPlacementChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPlacement === "all"
                ? "bg-[var(--ad-primary)] text-white"
                : "bg-[var(--ad-background)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] border border-[var(--ad-border)]"
            }`}
          >
            All ({ads.length})
          </button>
          {placements.map((p) => (
            <button
              key={p.value}
              onClick={() => onPlacementChange(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedPlacement === p.value
                  ? "bg-[var(--ad-primary)] text-white"
                  : "bg-[var(--ad-background)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] border border-[var(--ad-border)]"
              }`}
            >
              {p.label.split(" ")[0]} ({p.ads.length})
            </button>
          ))}
        </div>
      </div>

      {/* Ads List */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow)] overflow-hidden">
        {ads.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-[var(--ad-text-secondary)] mb-3" />
            <h3 className="text-lg font-semibold text-[var(--ad-text-primary)]">No ads found</h3>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
              {selectedPlacement === "all" 
                ? "Create your first advertisement to get started." 
                : "No ads in this placement."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--ad-border)]">
            {ads.map((ad) => (
              <AdListItem key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdListItem({ ad }: { ad: AdItem }) {
  const config = placementConfigs[ad.placement];
  
  return (
    <div className="p-5 hover:bg-[var(--ad-background)]/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-full sm:w-40 h-24 rounded-lg overflow-hidden border border-[var(--ad-border)] bg-[var(--ad-background)]">
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-[var(--ad-text-primary)] truncate">
                {ad.title}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--ad-text-secondary)]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {config?.label || ad.placement}
                </span>
                <span>•</span>
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
                  className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--ad-primary)] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ad.targetUrl.length > 40 ? ad.targetUrl.substring(0, 40) + "..." : ad.targetUrl}
                </a>
              )}
            </div>

            {/* Status Badge */}
            <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              ad.isActive 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {ad.isActive ? (
                <><Eye className="h-3 w-3" /> Active</>
              ) : (
                <><EyeOff className="h-3 w-3" /> Inactive</>
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
          <form action={toggleAdStatusAction.bind(null, ad.id, !ad.isActive)}>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ad.isActive
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              {ad.isActive ? (
                <><EyeOff className="h-3.5 w-3.5" /> Pause</>
              ) : (
                <><Eye className="h-3.5 w-3.5" /> Activate</>
              )}
            </button>
          </form>
          <form action={deleteAdAction.bind(null, ad.id)}>
            <button 
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
