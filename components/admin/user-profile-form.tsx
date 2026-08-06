"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveAdminProfileAction } from "@/app/(admin)/admin/actions";
import { Panel, Field, Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserProfileFormProps = {
  initial: {
    adminName?: string | null;
    adminEmail?: string | null;
    adminPhone?: string | null;
    fallbackEmail: string;
  };
};

type UserFormState = {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialState: AdminActionState = { status: "idle" };
const MIN_PASSWORD_LENGTH = 6;

export function UserProfileForm({ initial }: UserProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveAdminProfileAction, initialState);
  const [showPasswords, setShowPasswords] = useState(false);
  const [form, setForm] = useState<UserFormState>({
    adminName: initial.adminName ?? "",
    adminEmail: initial.adminEmail ?? initial.fallbackEmail,
    adminPhone: initial.adminPhone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = form.adminName
    ? form.adminName
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ম";

  const update =
    (field: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const mismatch =
    form.newPassword.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;
  const tooShort =
    form.newPassword.length > 0 && form.newPassword.length < MIN_PASSWORD_LENGTH;

  return (
    <form action={formAction} className="max-w-3xl space-y-4">
      {state.status === "success" && (
        <Alert tone="success">প্রোফাইল হালনাগাদ হয়েছে।</Alert>
      )}
      {state.status === "error" && state.message && (
        <Alert tone="error">{state.message}</Alert>
      )}

      <Panel kicker="পরিচয়" title="অ্যাডমিন প্রোফাইল">
        <div className="mb-5 flex items-center gap-3.5 border-b border-[var(--ad-border)] pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-[15px] font-bold text-[var(--ad-on-primary)]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[var(--ad-text-primary)]">
              {form.adminName || "অ্যাডমিন"}
            </p>
            <p className="adm-mono truncate text-[11.5px] text-[var(--ad-text-muted)]">
              {form.adminEmail || "—"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="পূর্ণ নাম" htmlFor="adminName">
            <Input
              id="adminName"
              name="adminName"
              type="text"
              value={form.adminName}
              onChange={update("adminName")}
              placeholder="অ্যাডমিন"
            />
          </Field>

          <Field label="ইমেইল" htmlFor="adminEmail">
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={update("adminEmail")}
              placeholder="admin@muktirkantho.com"
            />
          </Field>

          <Field label="ফোন" htmlFor="adminPhone" className="sm:col-span-2">
            <Input
              id="adminPhone"
              name="adminPhone"
              type="tel"
              value={form.adminPhone}
              onChange={update("adminPhone")}
              placeholder="+৮৮০…"
            />
          </Field>
        </div>
      </Panel>

      <Panel
        kicker="নিরাপত্তা"
        title="পাসওয়ার্ড পরিবর্তন"
        description="পরিবর্তন করতে না চাইলে ঘরগুলো খালি রাখুন।"
        actions={
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={() => setShowPasswords((s) => !s)}
            aria-label={showPasswords ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="বর্তমান পাসওয়ার্ড" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords ? "text" : "password"}
              value={form.currentPassword}
              onChange={update("currentPassword")}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>

          <Field
            label="নতুন পাসওয়ার্ড"
            htmlFor="newPassword"
            error={tooShort ? `কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষর দিন` : undefined}
          >
            <Input
              id="newPassword"
              name="newPassword"
              type={showPasswords ? "text" : "password"}
              value={form.newPassword}
              onChange={update("newPassword")}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={tooShort || undefined}
            />
          </Field>

          <Field
            label="পুনরায় লিখুন"
            htmlFor="confirmPassword"
            error={mismatch ? "পাসওয়ার্ড মিলছে না" : undefined}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={mismatch || undefined}
            />
          </Field>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || mismatch || tooShort}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ হচ্ছে…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              পরিবর্তন সংরক্ষণ
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
