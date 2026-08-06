"use client";

import { Fragment, useActionState, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { ImagePlus, X, Save, Eye, Loader2, Check, AlertCircle, Image as ImageIcon, Facebook, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generatePostSeo } from "@/lib/seo";
import { applyMarkdown, isBlockCommandActive, type MarkdownCommand } from "@/lib/markdown-commands";

type ToolbarButton = {
  command: MarkdownCommand;
  label: React.ReactNode;
  title: string;
  className?: string;
};

/**
 * Toolbar layout — each inner array renders as a group with a divider between.
 *
 * There is no video button: the sanitiser in `renderContent` strips iframes, so
 * the body can't embed a player. The dedicated YouTube field below handles that,
 * and a "video" button that only produced a plain link would duplicate Link.
 */
const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { command: "bold", label: "B", title: "Bold", className: "font-bold" },
    { command: "italic", label: <span className="italic">I</span>, title: "Italic" },
  ],
  [
    { command: "h1", label: "H1", title: "Heading 1", className: "font-bold" },
    { command: "h2", label: "H2", title: "Heading 2", className: "font-bold" },
  ],
  [
    { command: "quote", label: "“ ”", title: "Blockquote", className: "font-serif" },
    { command: "link", label: "Link", title: "Insert link", className: "underline" },
    { command: "bullet", label: "•", title: "Bulleted list" },
    { command: "ordered", label: "1.", title: "Numbered list" },
  ],
  [
    {
      command: "image",
      label: <ImageIcon className="h-3.5 w-3.5" />,
      title: "Insert image",
      className: "flex items-center justify-center p-1.5",
    },
    { command: "code", label: "</>", title: "Code block" },
  ],
];

type Option = { id: string; name: string; slug: string; districtId?: string | null; divisionId?: string | null };
type Division = { id: string; name: string };
type SocialPlatform = { id: string; label: string; defaultEnabled: boolean };

const PLATFORM_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  facebook: { icon: Facebook, color: "text-[#1877f2]" },
};
type PostForm = {
  id?: string;
  slug?: string;
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

  // The status as persisted, which is what decides whether the public route
  // will actually serve this post. `form.status` tracks the unsaved dropdown.
  const isPublished = initial?.status === "published";

  // Per-post social sharing toggles, seeded from each platform's defaultEnabled.
  const [socialToggles, setSocialToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(socialPlatforms.map((p) => [p.id, p.defaultEnabled]))
  );
  const [uploadNotice, setUploadNotice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [state, formAction, pending] = useActionState(action, initialState);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  // Mirrored into state (not just the ref) because the toolbar's active badges
  // are derived from it and have to re-render when the caret moves.
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const syncSelection = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setSelection({ start: el.selectionStart, end: el.selectionEnd });
  }, []);

  /**
   * Restore the selection a toolbar command asked for.
   *
   * This has to wait for the commit that writes the new value: the textarea is
   * controlled, so React overwrites `value` — and with it the caret — on
   * re-render. A layout effect runs after that write but before paint, so the
   * caret never visibly jumps to the end of the text first.
   */
  useLayoutEffect(() => {
    const target = pendingSelection.current;
    if (!target) return;
    pendingSelection.current = null;

    const el = contentRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(target.start, target.end);
  });

  const runCommand = useCallback((command: MarkdownCommand) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const next = applyMarkdown(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
      command,
    );

    pendingSelection.current = { start: next.selectionStart, end: next.selectionEnd };
    setSelection({ start: next.selectionStart, end: next.selectionEnd });
    setForm((prev) => ({ ...prev, content: next.value }));
  }, []);

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
            <div
              role="toolbar"
              aria-label="Formatting"
              aria-controls="post-content"
              className="flex items-center gap-1.5 p-3 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 flex-wrap"
            >
              {TOOLBAR_GROUPS.map((group, groupIndex) => (
                <Fragment key={group[0].command}>
                  {groupIndex > 0 && <span className="w-px h-5 bg-[var(--ad-border)]" aria-hidden="true" />}
                  {group.map(({ command, label, title, className }) => {
                    const active = isBlockCommandActive(
                      form.content,
                      selection.start,
                      selection.end,
                      command,
                    );
                    return (
                      <button
                        key={command}
                        type="button"
                        title={title}
                        aria-label={title}
                        aria-pressed={active}
                        onClick={() => runCommand(command)}
                        className={`ed-tb-btn ${className ?? ""} ${active ? "active" : ""}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </Fragment>
              ))}
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-[var(--ad-text-muted)]">
                Markdown
              </span>
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
                  id="post-content"
                  ref={contentRef}
                  name="content"
                  rows={14}
                  className="font-mono min-h-[400px] leading-relaxed resize-y font-bangla"
                  placeholder="Write your content here... (Markdown supported)"
                  value={form.content}
                  onChange={(e) => {
                    setForm({ ...form, content: e.target.value });
                    syncSelection();
                  }}
                  onSelect={syncSelection}
                  onFocus={syncSelection}
                  required
                />
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
              <span className="text-[9px] font-mono tracking-wider uppercase text-[var(--ad-text-muted)] font-semibold">Auto-generated</span>
            </CardHeader>
            {/* Read-only preview only. These fields are never submitted — the
                server recomputes them from title and content in
                `normalizePostPayload`, so posting them would be ignored at best
                and misleading at worst. */}
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Meta Title</label>
                <Input
                  className="font-medium font-bangla h-10"
                  value={generatedSeo.metaTitle}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2">Meta Description</label>
                <Textarea
                  rows={2}
                  className="min-h-[80px] font-medium font-bangla resize-none"
                  value={generatedSeo.metaDescription}
                  readOnly
                />
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
                  /* Gated on the *saved* status, not `form.status`: the public
                     route serves published posts only, so linking off an unsaved
                     dropdown change would land on a 404. */
                  isPublished && form.slug ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full py-6 font-bold uppercase tracking-wider text-xs"
                    >
                      <a href={`/news/${form.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                        Preview
                      </a>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      title="Publish and save this post to view it on the site."
                      className="w-full py-6 font-bold uppercase tracking-wider text-xs"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  )
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
                  {/* Marks that the editor rendered these controls at all, so the
                      server can tell "unticked on purpose" from "never shown"
                      — an unchecked checkbox submits nothing either way. */}
                  <input type="hidden" name="shareFacebookPresent" value="1" />
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


