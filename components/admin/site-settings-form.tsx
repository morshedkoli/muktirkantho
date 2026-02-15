"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveSiteSettingsAction } from "@/app/(admin)/admin/actions";

type SiteSettingsFormProps = {
  initial: {
    contactAddress?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  };
};

type SettingsFormState = {
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
};

const initialState: AdminActionState = { status: "idle" };

export function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSiteSettingsAction, initialState);
  const [form, setForm] = useState<SettingsFormState>({
    contactAddress: initial.contactAddress ?? "",
    contactPhone: initial.contactPhone ?? "",
    contactEmail: initial.contactEmail ?? "",
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.message}</p>
      ) : null}

      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-2">
          Footer Contact Information
        </h3>
        <p className="text-sm text-[var(--ad-text-secondary)] mb-6">
          This information appears in the footer Contact Us section.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
              Address
            </label>
            <textarea
              name="contactAddress"
              value={form.contactAddress}
              onChange={(event) => setForm((prev) => ({ ...prev, contactAddress: event.target.value }))}
              rows={3}
              placeholder="123 News Street, Dhaka-1200, Bangladesh"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                Phone
              </label>
              <input
                name="contactPhone"
                type="text"
                value={form.contactPhone}
                onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                placeholder="+880 1234-567890"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                Email
              </label>
              <input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
                placeholder="editor@muktirkantho.com"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {pending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
