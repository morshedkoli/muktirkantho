"use client";

import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { ImagePlus, X, Save, Eye, Loader2, Check, AlertCircle, Image, Video, Facebook, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Option = { id: string; name: string; slug: string; districtId?: string | null; divisionId?: string | null };
type Division = { id: string; name: string };
type SocialPlatform = { id: string; label: string; defaultEnabled: boolean };

const PLATFORM_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  facebook: { icon: Facebook, color: "text-[#1877f2]" },
};
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
  divisions: Division[];
  districts: Option[];
  upazilas: Option[];
  socialPlatforms: SocialPlatform[];
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
  divisions,
  districts,
  upazilas,
  socialPlatforms,
  initial,
  action,
  initialState,
}: Props) {
  const [form, setForm] = useState<PostForm>(initial ?? empty);

  // Per-post social sharing toggles, seeded from each platform's defaultEnabled.
  const [socialToggles, setSocialToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(socialPlatforms.map((p) => [p.id, p.defaultEnabled]))
  );
  const [uploadNotice, setUploadNotice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [state, formAction, pending] = useActionState(action, initialState);

  // Derive initial division from the post's district (edit mode).
  const [divisionId, setDivisionId] = useState<string>(() => {
    if (!initial?.districtId) return "";
    const d = districts.find((x) => x.id === initial.districtId);
    return d?.divisionId ?? "";
  });

  // Only show districts for the selected division; if no division picked, show all.
  const filteredDistricts = useMemo(
    () => (divisionId ? districts.filter((d) => d.divisionId === divisionId) : districts),
    [divisionId, districts],
  );

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
        <div className="rounded-2xl border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/5 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-5 w-5 text-[var(--ad-error)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ad-error)] font-medium leading-relaxed">{state.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6 order-1">

          {/* Editor Toolbar & Text Body */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-1.5 p-3 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 flex-wrap">
              <button type="button" className="ed-tb-btn active font-bold">B</button>
              <button type="button" className="ed-tb-btn"><span className="italic">I</span></button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn font-bold">H1</button>
              <button type="button" className="ed-tb-btn font-bold">H2</button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn font-serif">“ ”</button>
              <button type="button" className="ed-tb-btn underline">Link</button>
              <button type="button" className="ed-tb-btn">•</button>
              <button type="button" className="ed-tb-btn">1.</button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn flex items-center justify-center p-1.5">
                <Image className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="ed-tb-btn flex items-center justify-center p-1.5">
                <Video className="h-3.5 w-3.5" />
              </button>
              <span className="w-px h-5 bg-[var(--ad-border)]" />
              <button type="button" className="ed-tb-btn">{"<"}/{">"}</button>
              <button type="button" className="ed-tb-btn ml-auto font-mono text-[9.5px] uppercase tracking-wider text-[var(--ad-text-secondary)]">
                More...
              </button>
            </div>

            {/* Basic Info */}
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  Title <span className="text-[var(--ad-error)]">*</span>
                </label>
                <Input
                  name="title"
                  className="text-lg font-bold font-bangla h-12"
                  placeholder="Enter article title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  Content <span className="text-[var(--ad-error)]">*</span>
                </label>
                <Textarea
                  name="content"
                  rows={14}
                  className="font-mono min-h-[400px] leading-relaxed resize-y font-bangla"
                  placeholder="Write your content here... (Markdown supported)&#10;&#10;Use / for commands or @ to mention..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>

              {/* Callout Block */}
              <div className="border-l-4 border-[var(--ad-primary)] bg-[var(--ad-primary)]/5 p-4 rounded-r-xl flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--ad-primary)] font-extrabold shrink-0">Breaking</span>
                <span className="text-xs text-[var(--ad-text-secondary)] font-semibold">This content will be highlighted as a callout block in the article</span>
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  YouTube Video <span className="text-[var(--ad-text-muted)]/70">(Optional)</span>
                </label>
                <Input
                  name="youtubeUrl"
                  type="url"
                  className="h-10"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl ?? ""}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-3.5">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {form.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[var(--ad-border)] shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => setForm({ ...form, imageUrl: "", imagePublicId: "" })}
                    className="absolute top-3 right-3 h-8 w-8 cursor-pointer rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all bg-[var(--ad-background)]/50 ${isUploading
                      ? "border-[var(--ad-primary)] cursor-wait"
                      : "border-[var(--ad-border)] cursor-pointer hover:border-[var(--ad-primary)] hover:bg-[var(--ad-border)]/10"
                      }`}
                  >
                    {isUploading ? (
                      <div className="w-full max-w-[200px] flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-[var(--ad-primary)] animate-spin" />
                        <div className="w-full h-1.5 bg-[var(--ad-border)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--ad-primary)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-[var(--ad-text-primary)]">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-[var(--ad-text-muted)] mb-2" />
                        <span className="text-xs font-bold text-[var(--ad-text-primary)]">Click to upload image</span>
                        <span className="text-[10px] text-[var(--ad-text-muted)] font-medium mt-1">JPG, PNG or WEBP (max 3MB)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
              {uploadNotice && (
                <div className={`mt-3 flex items-center gap-2 text-[10px] font-mono tracking-wider font-semibold ${uploadNotice.includes("successfully") ? "text-[var(--ad-green)]" : "text-[var(--ad-error)]"}`}>
                  {uploadNotice.includes("successfully") ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {uploadNotice}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">SEO Settings</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[var(--ad-green-light)] px-2.5 py-0.5 rounded-full border border-[var(--ad-green)]/10 text-[var(--ad-green)]">
                  <span className="text-xs font-black font-mono">87</span>
                  <span className="text-[9px] tracking-wider font-mono">/100</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Meta Title</label>
                <Input
                  className="font-medium font-bangla h-10"
                  value={generatedSeo.metaTitle}
                  readOnly
                />
                <input type="hidden" name="metaTitle" value={generatedSeo.metaTitle} />
              </div>
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Meta Description</label>
                <Textarea
                  rows={2}
                  className="min-h-[80px] font-medium font-bangla resize-none"
                  value={generatedSeo.metaDescription}
                  readOnly
                />
                <input type="hidden" name="metaDescription" value={generatedSeo.metaDescription} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 order-2">
          {/* Publish Panel */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-3.5">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Publish</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Status</label>
                <Select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>

              <div className="flex items-center justify-between py-1.5 px-1 border border-transparent rounded-xl hover:bg-[var(--ad-background)]/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-[var(--ad-text-primary)]">Featured Article</p>
                  <p className="text-[10px] text-[var(--ad-text-muted)] font-semibold mt-0.5">Highlight on homepage</p>
                </div>
                <Switch
                  name="featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
              </div>

              <input type="hidden" name="author" value={form.author} />

              <div className="pt-4 border-t border-[var(--ad-border)] space-y-2.5">
                <Button
                  disabled={pending}
                  type="submit"
                  variant="default"
                  className="w-full py-6 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[var(--ad-primary)]/20"
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
                </Button>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 font-bold uppercase tracking-wider text-xs"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing Panel */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-3.5">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Social Sharing</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {socialPlatforms.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-5 text-center">
                  <div className="h-10 w-10 rounded-xl bg-[var(--ad-border)]/30 flex items-center justify-center">
                    <Share2 className="h-4.5 w-4.5 text-[var(--ad-text-muted)]" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--ad-text-secondary)]">No accounts connected</p>
                  <p className="text-[10px] text-[var(--ad-text-muted)] max-w-[160px] leading-relaxed">
                    Connect social media to auto-share posts when publishing.
                  </p>
                  <a
                    href="/admin/facebook"
                    className="mt-1 text-[11px] font-bold text-[var(--ad-primary)] hover:underline uppercase tracking-wider"
                  >
                    Configure →
                  </a>
                </div>
              ) : (
                <div className="space-y-1">
                  {socialPlatforms.map((platform) => {
                    const meta = PLATFORM_META[platform.id];
                    const Icon = meta?.icon;
                    const formName = `share${platform.id.charAt(0).toUpperCase()}${platform.id.slice(1)}`;
                    const enabled = socialToggles[platform.id] ?? false;
                    return (
                      <div
                        key={platform.id}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-[var(--ad-background)]/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-[var(--ad-primary)]/10" : "bg-[var(--ad-border)]/30"}`}>
                            {Icon && <Icon className={`h-4 w-4 ${enabled ? (meta.color) : "text-[var(--ad-text-muted)]"}`} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--ad-text-primary)]">{platform.label}</p>
                            <p className="text-[10px] text-[var(--ad-text-muted)]">
                              {enabled ? "Will share on publish" : "Won't share"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          name={formName}
                          checked={enabled}
                          onCheckedChange={(val) =>
                            setSocialToggles((prev) => ({ ...prev, [platform.id]: val }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Panel */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-3.5">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Organization</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  Category <span className="text-[var(--ad-error)]">*</span>
                </label>
                <Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  Division
                </label>
                <Select
                  value={divisionId}
                  onChange={(e) => {
                    setDivisionId(e.target.value);
                    setForm((f) => ({ ...f, districtId: "", upazilaId: "" }));
                  }}
                >
                  <option value="">All Divisions</option>
                  {divisions.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  District <span className="text-[var(--ad-error)]">*</span>
                </label>
                <Select
                  name="districtId"
                  value={form.districtId}
                  onChange={(e) => setForm({ ...form, districtId: e.target.value, upazilaId: "" })}
                  required
                >
                  <option value="">
                    {divisionId ? "Select district..." : "Select division first or pick any..."}
                  </option>
                  {filteredDistricts.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">
                  Upazila <span className="text-[var(--ad-text-muted)]/70">(Optional)</span>
                </label>
                <Select
                  name="upazilaId"
                  value={form.upazilaId}
                  onChange={(e) => setForm({ ...form, upazilaId: e.target.value })}
                  disabled={!form.districtId}
                >
                  <option value="">Select upazila...</option>
                  {filteredUpazilas.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Tags</label>
                <Input
                  name="tags"
                  className="h-10"
                  placeholder="e.g. politics, sports, news"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <p className="mt-1.5 font-mono text-[9px] tracking-wider text-[var(--ad-text-muted)] font-semibold uppercase">Separate with commas</p>
              </div>
            </CardContent>
          </Card>
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

