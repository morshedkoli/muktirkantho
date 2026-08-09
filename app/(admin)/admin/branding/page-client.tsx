"use client";

import { useActionState, useState, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { saveBrandingSettingsAction } from "@/app/(admin)/admin/actions";
import { SITE_NAME } from "@/lib/site-name";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { AlertCircle, Upload, X, Loader2 } from "lucide-react";

type SiteSettings = {
  logoUrl?: string | null;
  logoPublicId?: string | null;
  iconUrl?: string | null;
  iconPublicId?: string | null;
  faviconUrl?: string | null;
  faviconPublicId?: string | null;
  logoHeight?: number | null;
};

const DEFAULT_LOGO_HEIGHT = 48;
const MIN_LOGO_HEIGHT = 24;
const MAX_LOGO_HEIGHT = 120;

type UploadStatus = {
  logo: { uploading: boolean; error: string | null };
  icon: { uploading: boolean; error: string | null };
  favicon: { uploading: boolean; error: string | null };
};

const initialState: AdminActionState = { status: "idle" };

export default function BrandingPageClient({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveBrandingSettingsAction, initialState);
  const [form, setForm] = useState({
    logoUrl: settings?.logoUrl ?? "",
    logoPublicId: settings?.logoPublicId ?? "",
    iconUrl: settings?.iconUrl ?? "",
    iconPublicId: settings?.iconPublicId ?? "",
    faviconUrl: settings?.faviconUrl ?? "",
    faviconPublicId: settings?.faviconPublicId ?? "",
    logoHeight: settings?.logoHeight ?? DEFAULT_LOGO_HEIGHT,
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    logo: { uploading: false, error: null },
    icon: { uploading: false, error: null },
    favicon: { uploading: false, error: null },
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File,
    type: "logo" | "icon" | "favicon"
  ) => {
    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: { uploading: false, error: "Please upload JPG, PNG, WebP, or SVG files only." },
      }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: { uploading: false, error: "File size must be less than 2MB." },
      }));
      return;
    }

    setUploadStatus((prev) => ({
      ...prev,
      [type]: { uploading: true, error: null },
    }));

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("category", "branding");

      const response = await fetch("/api/upload", { method: "POST", body: data });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Upload failed.");
      }

      // Update form with uploaded image URL and public ID
      setForm((prev) => ({
        ...prev,
        [`${type}Url`]: payload.secure_url,
        [`${type}PublicId`]: payload.public_id,
      }));

      setUploadStatus((prev) => ({
        ...prev,
        [type]: { uploading: false, error: null },
      }));
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: {
          uploading: false,
          error: error instanceof Error ? error.message : "Upload failed. Please try again.",
        },
      }));
    }
  };

  const handleRemoveImage = (type: "logo" | "icon" | "favicon") => {
    setForm((prev) => ({
      ...prev,
      [`${type}Url`]: "",
      [`${type}PublicId`]: "",
    }));
    // Reset file input
    if (type === "logo" && logoInputRef.current) logoInputRef.current.value = "";
    if (type === "icon" && iconInputRef.current) iconInputRef.current.value = "";
    if (type === "favicon" && faviconInputRef.current) faviconInputRef.current.value = "";
  };

  const UploadSection = ({
    type,
    title,
    description,
    recommendedSize,
    previewSize,
    currentUrl,
    currentPublicId,
    usedFor,
  }: {
    type: "logo" | "icon" | "favicon";
    title: string;
    description: string;
    recommendedSize: string;
    previewSize: { width: number; height: number };
    currentUrl: string;
    currentPublicId: string;
    /** Where this asset shows up once uploaded — and what goes missing if it isn't. */
    usedFor: string;
  }) => {
    const status = uploadStatus[type];
    const inputRef = type === "logo" ? logoInputRef : type === "icon" ? iconInputRef : faviconInputRef;

    return (
      <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 sm:p-6 shadow-[var(--ad-shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
          {title}
        </h2>
        <p className="mt-1 mb-4 max-w-prose text-sm text-[var(--ad-text-secondary)]">
          {description}
        </p>
        {/* Upload Area */}
        <div className="mb-4">
          <div className="border-2 border-dashed border-[var(--ad-border)] rounded-lg p-6 text-center hover:border-[var(--ad-primary)] transition-colors bg-[var(--ad-background)]">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, type);
              }}
              className="hidden"
              id={`${type}-upload`}
            />

            {status.uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-[var(--ad-primary)] animate-spin" />
                <span className="text-sm text-[var(--ad-text-secondary)]">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <label
                htmlFor={`${type}-upload`}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-[var(--ad-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--ad-text-primary)]">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-[var(--ad-text-secondary)]">
                  {recommendedSize} • Max 2MB • JPG, PNG, WebP, SVG
                </span>
              </label>
            )}
          </div>

          {status.error && (
            <div className="mt-2 rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-3 py-2 text-sm text-[var(--ad-error)] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {status.error}
            </div>
          )}
        </div>

        {/* Preview Area — the upload itself, or an honest empty state. There is
            no bundled default to fall back on any more, so "nothing uploaded"
            has to look like nothing uploaded. */}
        {currentUrl ? (
          <div className="relative inline-block p-4 rounded-lg bg-[var(--ad-background)] border border-[var(--ad-border)]">
            <button
              type="button"
              onClick={() => handleRemoveImage(type)}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-[var(--ad-error)] text-[var(--ad-on-error)] hover:bg-[var(--ad-error)]/80 transition-colors shadow-md"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-xs text-[var(--ad-text-secondary)] mb-2">In use:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt={`Current ${title}`}
              width={previewSize.width}
              height={previewSize.height}
              className="rounded"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ad-border-strong)] bg-[var(--ad-background)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--ad-text-primary)]">Not set</p>
            <p className="mt-0.5 text-xs text-[var(--ad-text-secondary)]">{usedFor}</p>
          </div>
        )}

        {/* Hidden inputs for form submission */}
        <input type="hidden" name={`${type}Url`} value={currentUrl} />
        <input type="hidden" name={`${type}PublicId`} value={currentPublicId} />
      </section>
    );
  };

  return (
    <AdminShell
      title="Branding & Logo"
      description="Manage your site branding, logos, and visual identity"
    >
      <form action={formAction} className="space-y-8">
        {/* Status Messages */}
        {state.status === "error" && state.message && (
          <div className="rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-4 py-3 text-sm text-[var(--ad-error)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}

        {/* Current Branding Preview */}
        <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 sm:p-6 shadow-[var(--ad-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
            Live Preview
          </h2>

          {/* Logo size control */}
          <div className="mb-5 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <label htmlFor="logoHeight" className="text-sm font-medium text-[var(--ad-text-primary)]">
                  Logo display height
                </label>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={MIN_LOGO_HEIGHT}
                  max={MAX_LOGO_HEIGHT}
                  value={form.logoHeight}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) {
                      setForm((p) => ({ ...p, logoHeight: Math.max(MIN_LOGO_HEIGHT, Math.min(MAX_LOGO_HEIGHT, Math.round(v))) }));
                    }
                  }}
                  className="w-20 rounded-md border border-[var(--ad-border)] bg-[var(--ad-card)] px-2 py-1.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)]"
                />
                <span className="font-mono text-xs text-[var(--ad-text-secondary)]">px</span>
              </div>
            </div>
            <input
              id="logoHeight"
              type="range"
              min={MIN_LOGO_HEIGHT}
              max={MAX_LOGO_HEIGHT}
              step={2}
              value={form.logoHeight}
              onChange={(e) => setForm((p) => ({ ...p, logoHeight: Number(e.target.value) }))}
              className="w-full accent-[var(--ad-primary)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--ad-text-secondary)] mt-1">
              <span>{MIN_LOGO_HEIGHT}px</span>
              <span>Default: {DEFAULT_LOGO_HEIGHT}px</span>
              <span>{MAX_LOGO_HEIGHT}px</span>
            </div>
            {/* Hidden field for form submission */}
            <input type="hidden" name="logoHeight" value={form.logoHeight} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Light Mode Preview — uses Main Logo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--ad-text-primary)]">Light Mode</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ad-text-secondary)]">
                  uses Main Logo
                </span>
              </div>
              <div className="bg-white rounded-lg p-6 border border-[var(--ad-border)] min-h-[120px] flex items-center">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt="Light mode logo"
                    style={{ height: `${form.logoHeight}px`, width: "auto" }}
                  />
                ) : (
                  // Exactly what the live site renders with no logo uploaded.
                  <span
                    className="font-bold leading-none tracking-tight text-[#17171a]"
                    style={{ fontSize: `${Math.round(form.logoHeight * 0.62)}px` }}
                  >
                    {SITE_NAME}
                  </span>
                )}
              </div>
            </div>

            {/* Dark Mode Preview — uses Dark Logo (stored in iconUrl) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--ad-text-primary)]">Dark Mode</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ad-text-secondary)]">
                  uses Dark Mode Logo
                </span>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[var(--ad-border)] min-h-[120px] flex items-center">
                {form.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.iconUrl}
                    alt="Dark mode logo"
                    style={{ height: `${form.logoHeight}px`, width: "auto" }}
                  />
                ) : form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt="Logo (using main logo as fallback)"
                    style={{ height: `${form.logoHeight}px`, width: "auto", opacity: 0.8 }}
                  />
                ) : (
                  <span
                    className="font-bold leading-none tracking-tight text-white"
                    style={{ fontSize: `${Math.round(form.logoHeight * 0.62)}px` }}
                  >
                    {SITE_NAME}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Light-mode logo (Main Logo) */}
        <UploadSection
          type="logo"
          title="Light Mode Logo"
          description="The primary logo shown when visitors are using the light theme. Use a logo with dark colors that look good on a white background."
          recommendedSize="320 × 90 px"
          previewSize={{ width: 200, height: 50 }}
          currentUrl={form.logoUrl}
          currentPublicId={form.logoPublicId}
          usedFor="Until you upload one, the masthead and footer set the site name as text instead."
        />

        {/* Dark-mode logo (stored in iconUrl) */}
        <UploadSection
          type="icon"
          title="Dark Mode Logo"
          description="The alternate logo shown when visitors switch to the dark theme. Use a version with light or white text that's readable on a dark background. If left empty, the light-mode logo will be used in both themes."
          recommendedSize="320 × 90 px"
          previewSize={{ width: 200, height: 50 }}
          currentUrl={form.iconUrl}
          currentPublicId={form.iconPublicId}
          usedFor="Without it the light-mode logo is used in dark mode, flattened to white."
        />

        {/* Favicon Upload */}
        <UploadSection
          type="favicon"
          title="Favicon"
          description="Browser tab icon, bookmark icon, and the credit stamp on article photos."
          recommendedSize="32x32px"
          previewSize={{ width: 32, height: 32 }}
          currentUrl={form.faviconUrl}
          currentPublicId={form.faviconPublicId}
          usedFor="Falls back to the dark then light logo. With none of the three, the tab shows the browser's own icon and photos carry a text-only credit."
        />

        {/* Where these land beyond the header — the post fallback in particular
            is easy to miss, and it is the one an editor notices first. */}
        <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
            Posts without a featured image
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[var(--ad-text-secondary)]">
            Your logo stands in for the photo on news cards and hero blocks —
            centred on a newsprint panel, not cropped to fill. The light-mode
            logo is used first, then the dark logo, then the favicon.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex aspect-video w-56 items-center justify-center overflow-hidden rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] p-[10%]">
              {form.logoUrl || form.iconUrl || form.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl || form.iconUrl || form.faviconUrl}
                  alt="Post fallback preview"
                  className="max-h-full max-w-full object-contain opacity-45"
                />
              ) : (
                <span className="text-sm font-bold text-[var(--ad-text-secondary)]/60">
                  {SITE_NAME}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--ad-text-secondary)]">
              Preview at card size.
            </p>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--ad-on-primary)] shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {pending ? "Saving..." : "Save Branding Settings"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
