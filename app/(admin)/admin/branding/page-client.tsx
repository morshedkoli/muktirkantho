"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { SiteLogo, SiteLogoDark, SiteIcon, SiteFavicon } from "@/components/public/site-logo";
import { saveBrandingSettingsAction } from "@/app/(admin)/admin/actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { AlertCircle, Upload, X, Loader2 } from "lucide-react";

type SiteSettings = {
  logoUrl?: string | null;
  logoPublicId?: string | null;
  iconUrl?: string | null;
  iconPublicId?: string | null;
  faviconUrl?: string | null;
  faviconPublicId?: string | null;
};

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
    defaultComponent,
  }: {
    type: "logo" | "icon" | "favicon";
    title: string;
    description: string;
    recommendedSize: string;
    previewSize: { width: number; height: number };
    currentUrl: string;
    currentPublicId: string;
    defaultComponent: React.ReactNode;
  }) => {
    const status = uploadStatus[type];
    const inputRef = type === "logo" ? logoInputRef : type === "icon" ? iconInputRef : faviconInputRef;

    return (
      <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-2">
          {title}
        </h2>
        <p className="text-sm text-[var(--ad-text-secondary)] mb-4">
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
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {status.error}
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex items-center gap-6">
          {currentUrl ? (
            <div className="relative p-4 rounded-lg bg-[var(--ad-background)] border border-[var(--ad-border)]">
              <button
                type="button"
                onClick={() => handleRemoveImage(type)}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-xs text-[var(--ad-text-secondary)] mb-2">Current {title}:</p>
              <Image
                src={currentUrl}
                alt={`Current ${title}`}
                width={previewSize.width}
                height={previewSize.height}
                className="rounded"
              />
            </div>
          ) : null}
          
          <div className="p-4 rounded-lg bg-[var(--ad-background)] border border-[var(--ad-border)]">
            <p className="text-xs text-[var(--ad-text-secondary)] mb-2">Default:</p>
            {defaultComponent}
          </div>
        </div>

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
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}

        {/* Current Branding Preview */}
        <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
            Current Branding Preview
          </h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Light Mode Preview */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ad-text-secondary)] mb-3">Light Mode</h3>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt="Site Logo"
                    width={220}
                    height={56}
                    className="h-auto w-[180px]"
                  />
                ) : (
                  <SiteLogo width={180} height={48} />
                )}
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ad-text-secondary)] mb-3">Dark Mode</h3>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt="Site Logo"
                    width={220}
                    height={56}
                    className="h-auto w-[180px]"
                  />
                ) : (
                  <SiteLogoDark width={180} height={48} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Logo Upload */}
        <UploadSection
          type="logo"
          title="Main Logo"
          description="Upload your main site logo. This will be displayed in the masthead. For best results in dark mode, use a logo with light/white text or a version that works on both backgrounds."
          recommendedSize="320x90px"
          previewSize={{ width: 200, height: 50 }}
          currentUrl={form.logoUrl}
          currentPublicId={form.logoPublicId}
          defaultComponent={<SiteLogo width={160} height={40} />}
        />

        {/* Icon Upload */}
        <UploadSection
          type="icon"
          title="Site Icon"
          description="Square icon for use in various parts of the site."
          recommendedSize="48x48px"
          previewSize={{ width: 48, height: 48 }}
          currentUrl={form.iconUrl}
          currentPublicId={form.iconPublicId}
          defaultComponent={<SiteIcon size={48} />}
        />

        {/* Favicon Upload */}
        <UploadSection
          type="favicon"
          title="Favicon"
          description="Browser tab icon and bookmark icon."
          recommendedSize="32x32px"
          previewSize={{ width: 32, height: 32 }}
          currentUrl={form.faviconUrl}
          currentPublicId={form.faviconPublicId}
          defaultComponent={<SiteFavicon size={32} />}
        />

        {/* Default Logos Section */}
        <section className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
            Default SVG Logos (Auto Dark Mode)
          </h2>
          <p className="text-sm text-[var(--ad-text-secondary)] mb-4">
            If no custom logo is uploaded, these default SVG logos will be used. They automatically adapt to both light and dark modes for maximum visibility.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-[var(--ad-text-secondary)] mb-3">Light Mode</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200 inline-block">
                <SiteLogo width={160} height={44} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--ad-text-secondary)] mb-3">Dark Mode</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 inline-block">
                <SiteLogoDark width={160} height={44} />
              </div>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {pending ? "Saving..." : "Save Branding Settings"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
