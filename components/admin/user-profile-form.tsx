"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveAdminProfileAction } from "@/app/(admin)/admin/actions";
import { User, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

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
    ? form.adminName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const updateField = (field: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {/* Status messages */}
      {state.status === "success" && (
        <div className="rounded-xl border border-[var(--ad-success)]/20 bg-[var(--ad-success)]/10 px-5 py-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-[var(--ad-success)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ad-success)] font-medium">Profile updated successfully.</p>
        </div>
      )}
      {state.status === "error" && state.message && (
        <div className="rounded-xl border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--ad-error)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ad-error)] font-medium">{state.message}</p>
        </div>
      )}

      {/* Admin Identity */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ad-primary)] text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--ad-text-primary)]">Admin Profile</h3>
              <p className="text-xs text-[var(--ad-text-secondary)]">Manage your profile details and security</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">Full Name</label>
              <input
                name="adminName"
                type="text"
                value={form.adminName}
                onChange={updateField("adminName")}
                placeholder="Administrator"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">Email Address</label>
              <input
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={updateField("adminEmail")}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">Phone Number</label>
              <input
                name="adminPhone"
                type="text"
                value={form.adminPhone}
                onChange={updateField("adminPhone")}
                placeholder="+880..."
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ad-paper-2)]">
              <Shield className="h-5 w-5 text-[var(--ad-text-secondary)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">Change Password</h3>
              <p className="text-xs text-[var(--ad-text-secondary)]">Leave empty to keep current password</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowPasswords(!showPasswords)}
            className="p-2 rounded-lg text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors"
            title={showPasswords ? "Hide passwords" : "Show passwords"}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">Current Password</label>
              <input
                name="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={form.currentPassword}
                onChange={updateField("currentPassword")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">New Password</label>
              <input
                name="newPassword"
                type={showPasswords ? "text" : "password"}
                value={form.newPassword}
                onChange={updateField("newPassword")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)] uppercase tracking-wider">Confirm Password</label>
              <input
                name="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
                autoComplete="new-password"
              />
            </div>
          </div>
          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="mt-2 text-xs text-[var(--ad-error)] flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Passwords do not match
            </p>
          )}
          {form.newPassword && form.newPassword.length > 0 && form.newPassword.length < 6 && (
            <p className="mt-2 text-xs text-[var(--ad-warning)] flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Password must be at least 6 characters
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {pending ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            "Save Changes"
          )}
        </button>
        {state.status === "success" && (
          <span className="flex items-center gap-1 text-xs text-[var(--ad-success)]">
            <CheckCircle className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
