"use client";

import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { ImagePlus, X, Save, Eye, Loader2, Check, AlertCircle, Image, Video } from "lucide-react";

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
  youtubeUrl?: string;
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
  youtubeUrl: "",
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

  const generatedSeo = useMemo(
    () => generatePostSeo(form.title, form.content),
    [form.title, form.content],
  );

  const onUploadImage = async (file: File) => {
    setUploadNotice("");
    setUploadProgress(0);

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
        <div className="border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--ad-error)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ad-error)]">{state.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6 order-1">

          {/* Editor Toolbar */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-[var(--ad-border)] flex-wrap">
              <button type="button" className="ed-tb-btn active">B</button>
              <button type="button" className="ed-tb-btn"><span className="italic">I</span></button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn">H1</button>
              <button type="button" className="ed-tb-btn">H2</button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn">{"\u201C"}{"\u201D"}</button>
              <button type="button" className="ed-tb-btn">Link</button>
              <button type="button" className="ed-tb-btn">{"\u2022"}</button>
              <button type="button" className="ed-tb-btn">1.</button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn">
                <Image className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="ed-tb-btn">
                <Video className="h-3.5 w-3.5" />
              </button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn">{"<"}/{">"}</button>
              <button type="button" className="ed-tb-btn ml-auto font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">
                More...
              </button>
            </div>

            {/* Basic Info */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  Title <span className="text-[var(--ad-error)]">*</span>
                </label>
                <input
                  name="title"
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-3 text-lg font-bold text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)] font-editorial-display"
                  placeholder="Enter article title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  Content <span className="text-[var(--ad-error)]">*</span>
                </label>
                <textarea
                  name="content"
                  rows={14}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-3 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors font-mono placeholder:text-[var(--ad-text-secondary)] min-h-[400px] leading-relaxed"
                  placeholder="Write your content here... (Markdown supported)

Use / for commands or @ to mention..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>

              {/* Callout Block */}
              <div className="border-l-4 border-[var(--ed-breaking)] bg-[var(--ad-paper)] p-4 flex items-center gap-3">
                <span className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-error)] shrink-0">Breaking</span>
                <span className="text-xs text-[var(--ad-text-secondary)]">This content will be highlighted as a callout block in the article</span>
              </div>

              {/* YouTube */}
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  YouTube Video <span className="text-[var(--ad-text-secondary)]/50">(Optional)</span>
                </label>
                <input
                  name="youtubeUrl"
                  type="url"
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl ?? ""}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-3.5">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">Featured Image</h3>
            </div>
            <div className="p-5">
              {form.imageUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-48 sm:h-64 object-cover border border-[var(--ad-border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "", imagePublicId: "" })}
                    className="absolute top-2 right-2 p-2 bg-[var(--ed-breaking)] text-white hover:bg-[var(--ad-error)]/80 transition-colors"
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
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed transition-all bg-[var(--ad-paper)]/50 ${isUploading
                      ? "border-[var(--ad-text-primary)] cursor-wait"
                      : "border-[var(--ad-border)] cursor-pointer hover:border-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)]"
                      }`}
                  >
                    {isUploading ? (
                      <div className="w-full max-w-[200px] flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-[var(--ad-text-primary)] animate-spin" />
                        <div className="w-full h-1.5 bg-[var(--ad-border)]">
                          <div className="h-full bg-[var(--ad-text-primary)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="font-editorial-mono text-xs text-[var(--ad-text-primary)]">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="h-10 w-10 text-[var(--ad-text-secondary)] mb-2" />
                        <span className="font-editorial-mono text-xs text-[var(--ad-text-secondary)]">Click to upload image</span>
                        <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] mt-1">JPG, PNG or WEBP (max 3MB)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
              {uploadNotice && (
                <div className={`mt-3 flex items-center gap-2 font-editorial-mono text-[10px] tracking-wider ${uploadNotice.includes("success") ? "text-[var(--ad-success)]" : "text-[var(--ad-error)]"}`}>
                  {uploadNotice.includes("success") ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {uploadNotice}
                </div>
              )}
            </div>
          </div>

          {/* SEO Card (collapsed) */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">SEO Settings</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[var(--ad-success)]">
                  <span className="font-editorial-display text-lg font-black">87</span>
                  <span className="font-editorial-mono text-[9px] tracking-wider">/100</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">Meta Title</label>
                <input
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors"
                  value={generatedSeo.metaTitle}
                  readOnly
                />
                <input type="hidden" name="metaTitle" value={generatedSeo.metaTitle} />
              </div>
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">Meta Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors resize-none"
                  value={generatedSeo.metaDescription}
                  readOnly
                />
                <input type="hidden" name="metaDescription" value={generatedSeo.metaDescription} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4 order-2">
          {/* Publish Panel */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)]">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-3.5">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">Publish</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-[var(--ad-text-primary)]">Featured</p>
                  <p className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">Show in featured section</p>
                </div>
                <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>

              <input type="hidden" name="author" value={form.author} />

              <div className="pt-3 border-t border-[var(--ad-border)] space-y-2.5">
                <button
                  disabled={pending}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[var(--ad-ink)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--ad-ink)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-editorial-mono tracking-wider uppercase"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === "create" ? "Publish Now" : "Update Post"}
                    </>
                  )}
                </button>
                {mode === "edit" && (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 border border-[var(--ad-border)] px-4 py-3 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors font-editorial-mono tracking-wider uppercase"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Social Sharing Panel */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)]">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-3.5">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">Social Sharing</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "X / Twitter", enabled: true },
                { label: "Facebook", enabled: true },
                { label: "Instagram", enabled: false },
                { label: "LinkedIn", enabled: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--ad-text-primary)]">{s.label}</span>
                  <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
                    <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Organization Panel */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)]">
            <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-3.5">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">Organization</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  Category <span className="text-[var(--ad-error)]">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  District <span className="text-[var(--ad-error)]">*</span>
                </label>
                <select
                  name="districtId"
                  value={form.districtId}
                  onChange={(e) => setForm({ ...form, districtId: e.target.value, upazilaId: "" })}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors"
                  required
                >
                  <option value="">Select district...</option>
                  {districts.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">
                  Upazila <span className="text-[var(--ad-text-secondary)]/50">(Opt.)</span>
                </label>
                <select
                  name="upazilaId"
                  value={form.upazilaId}
                  onChange={(e) => setForm({ ...form, upazilaId: e.target.value })}
                  disabled={!form.districtId}
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select upazila...</option>
                  {filteredUpazilas.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-2">Tags</label>
                <input
                  name="tags"
                  className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)]"
                  placeholder="e.g. politics, sports, news"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <p className="mt-1 font-editorial-mono text-[9px] tracking-wider text-[var(--ad-text-secondary)]">Separate with commas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function generatePostSeo(title: string, content: string) {
  const metaTitle = title || "{Untitled Article}";
  const plainText = content.replace(/[#*`\[\]()>_-]/g, " ").replace(/\s+/g, " ").trim();
  const metaDescription = plainText.substring(0, 155).trim() + (plainText.length > 155 ? "..." : "");
  return { metaTitle, metaDescription };
}
