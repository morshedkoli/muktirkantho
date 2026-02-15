"use client";

import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { ImagePlus, X, Save, Eye, Loader2, Check, AlertCircle } from "lucide-react";

type Option = { id: string; name: string; slug: string; districtId?: string };
type PostForm = {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: string;
  districtId: string;
  upazilaId?: string;
  tags: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  status: "draft" | "published";
};

type Props = {
  mode: "create" | "edit";
  categories: Option[];
  districts: Option[];
  upazilas: Option[];
  initial?: PostForm;
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
};

const empty: PostForm = {
  title: "",
  content: "",
  imageUrl: "",
  imagePublicId: "",
  categoryId: "",
  districtId: "",
  upazilaId: "",
  tags: "",
  author: "",
  metaTitle: "",
  metaDescription: "",
  featured: false,
  status: "draft",
};

export function PostEditor({
  mode,
  categories,
  districts,
  upazilas,
  initial,
  action,
  initialState,
}: Props) {
  const [form, setForm] = useState<PostForm>(initial ?? empty);
  const [uploadNotice, setUploadNotice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [state, formAction, pending] = useActionState(action, initialState);

  const filteredUpazilas = useMemo(
    () => upazilas.filter((item) => item.districtId === form.districtId),
    [form.districtId, upazilas],
  );

  const onUploadImage = async (file: File) => {
    setUploadNotice("");
    setUploadProgress(0);

    // Client-side validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadNotice("Invalid file type. Please use JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadNotice("File too large. Maximum size is 3MB.");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("category", categories.find((c) => c.id === form.categoryId)?.slug ?? "general");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 201) {
        try {
          const uploaded = JSON.parse(xhr.responseText);
          setForm((prev) => ({ ...prev, imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id }));
          setUploadNotice("Image uploaded successfully.");
        } catch {
          setUploadNotice("Upload successful but failed to parse response.");
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          setUploadNotice(error.error || "Upload failed.");
        } catch {
          setUploadNotice(`Upload failed with status ${xhr.status}.`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadNotice("Network error occurred during upload.");
    };

    xhr.send(data);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Error message */}
      {state.status === "error" && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800">{state.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">Basic Information</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="Enter post title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="content"
                  rows={12}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all font-mono placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="Write your content here... (Markdown supported)"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">Featured Image</h3>
            </div>
            <div className="p-6">
              {form.imageUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-[var(--ad-border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "", imagePublicId: "" })}
                    className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <input type="hidden" name="imageUrl" value={form.imageUrl} />
                  <input type="hidden" name="imagePublicId" value={form.imagePublicId} />
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUploadImage(file);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-all bg-[var(--ad-background)]/50 ${isUploading
                        ? "border-[var(--ad-primary)] cursor-wait"
                        : "border-[var(--ad-border)] cursor-pointer hover:border-[var(--ad-primary)] hover:bg-[var(--ad-background)]"
                      }`}
                  >
                    {isUploading ? (
                      <div className="w-full max-w-[200px] flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-[var(--ad-primary)] animate-spin" />
                        <div className="w-full h-2 bg-[var(--ad-border)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--ad-primary)] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--ad-text-primary)]">{uploadProgress}% Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-[var(--ad-text-secondary)] mb-2" />
                        <span className="text-sm text-[var(--ad-text-secondary)]">Click to upload image</span>
                        <span className="text-xs text-[var(--ad-text-secondary)] mt-1">JPG, PNG or WEBP (max 3MB)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
              {uploadNotice && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${uploadNotice.includes("success") ? "text-emerald-600" : "text-rose-600"
                  }`}>
                  {uploadNotice.includes("success") ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {uploadNotice}
                </div>
              )}
            </div>
          </div>

          {/* SEO Card */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">SEO Settings</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Meta Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="metaTitle"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="SEO title..."
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Meta Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="metaDescription"
                  rows={2}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all resize-none placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="SEO description..."
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">Recommended: 150-160 characters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publish Card */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">Publish</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--ad-text-secondary)]">Featured Post</label>
                  <p className="text-xs text-[var(--ad-text-secondary)]">Show in featured section</p>
                </div>
                <label className="relative inline-flex h-6 w-11 items-center cursor-pointer">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-primary)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Author <span className="text-rose-500">*</span>
                </label>
                <input
                  name="author"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="Author name..."
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--ad-border)] space-y-3">
                <button
                  disabled={pending}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--ad-primary)]/20"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === "create" ? "Create Post" : "Update Post"}
                    </>
                  )}
                </button>
                {mode === "edit" && (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-background)] transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories & Location Card */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">Organization</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  name="districtId"
                  value={form.districtId}
                  onChange={(e) => setForm({ ...form, districtId: e.target.value, upazilaId: "" })}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
                  required
                >
                  <option value="">Select district...</option>
                  {districts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Upazila <span className="text-[var(--ad-text-secondary)]/50">(Optional)</span>
                </label>
                <select
                  name="upazilaId"
                  value={form.upazilaId}
                  onChange={(e) => setForm({ ...form, upazilaId: e.target.value })}
                  disabled={!form.districtId}
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select upazila...</option>
                  {filteredUpazilas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-secondary)] mb-2">
                  Tags
                </label>
                <input
                  name="tags"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="e.g. politics, sports, news"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">Separate tags with commas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
