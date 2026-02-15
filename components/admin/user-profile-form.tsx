"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveAdminProfileAction } from "@/app/(admin)/admin/actions";

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
  const [form, setForm] = useState<UserFormState>({
    adminName: initial.adminName ?? "",
    adminEmail: initial.adminEmail ?? initial.fallbackEmail,
    adminPhone: initial.adminPhone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.message}</p>
      ) : null}

      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)]">
        <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">Profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">Name</label>
            <input
              name="adminName"
              type="text"
              value={form.adminName}
              onChange={(event) => setForm((prev) => ({ ...prev, adminName: event.target.value }))}
              placeholder="Administrator"
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">Email</label>
            <input
              name="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, adminEmail: event.target.value }))}
              placeholder="admin@example.com"
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">Phone</label>
            <input
              name="adminPhone"
              type="text"
              value={form.adminPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, adminPhone: event.target.value }))}
              placeholder="+880..."
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)]">
        <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">Change Password</h3>
        <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">Leave empty to keep current password.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">New Password</label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ad-text-secondary)]">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="w-full rounded-md border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save User Settings"}
      </button>
    </form>
  );
}
