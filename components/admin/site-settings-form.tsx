"use client";

import { useActionState, useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveSiteSettingsAction } from "@/app/(admin)/admin/actions";
import { Panel, Field, Alert } from "@/components/admin/ui";
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

const initialState: AdminActionState = { status: "idle" };

export function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSiteSettingsAction, initialState);
  const [form, setForm] = useState({
    contactAddress: initial.contactAddress ?? "",
    contactPhone: initial.contactPhone ?? "",
    contactEmail: initial.contactEmail ?? "",
  });

  return (
    <form action={formAction} className="max-w-3xl space-y-4">
      {state.status === "error" && state.message && (
        <Alert tone="error">{state.message}</Alert>
      )}
      {state.status === "success" && (
        <Alert tone="success">সেটিংস সংরক্ষিত হয়েছে।</Alert>
      )}

      <Panel
        kicker="ফুটার"
        title="যোগাযোগের তথ্য"
        description="সাইটের ফুটারে এই তথ্যগুলো পাঠকদের দেখানো হয়।"
      >
        <div className="space-y-4">
          <Field label="ঠিকানা" htmlFor="contactAddress">
            <Textarea
              id="contactAddress"
              name="contactAddress"
              rows={3}
              value={form.contactAddress}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactAddress: e.target.value }))
              }
              placeholder="১২৩ প্রেস রোড, ঢাকা-১২০০, বাংলাদেশ"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফোন" htmlFor="contactPhone">
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="+৮৮০ ১২৩৪-৫৬৭৮৯০"
              />
            </Field>

            <Field label="ইমেইল" htmlFor="contactEmail">
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                }
                placeholder="editor@muktirkantho.com"
              />
            </Field>
          </div>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ হচ্ছে…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
