"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveSiteSettingsAction } from "@/app/(admin)/admin/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
        <p className="rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-4 py-3 text-sm text-[var(--ad-error)]">{state.message}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Footer Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-2 font-mono">
              Address
            </label>
            <Textarea
              name="contactAddress"
              value={form.contactAddress}
              onChange={(event) => setForm((prev) => ({ ...prev, contactAddress: event.target.value }))}
              rows={3}
              placeholder="123 News Street, Dhaka-1200, Bangladesh"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-2 font-mono">
                Phone
              </label>
              <Input
                name="contactPhone"
                type="text"
                value={form.contactPhone}
                onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                placeholder="+880 1234-567890"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-2 font-mono">
                Email
              </label>
              <Input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
                placeholder="editor@muktirkantho.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[var(--ad-primary)] shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] text-white text-xs uppercase tracking-wider font-bold px-6"
        >
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

