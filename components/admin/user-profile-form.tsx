"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { saveAdminProfileAction } from "@/app/(admin)/admin/actions";
import { Shield, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="bg-[var(--ad-background)]/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ad-primary)] text-sm font-bold text-white shadow-lg shadow-[var(--ad-primary)]/20">
              {initials}
            </div>
            <div>
              <CardTitle>Admin Profile</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">Full Name</label>
              <Input
                name="adminName"
                type="text"
                value={form.adminName}
                onChange={updateField("adminName")}
                placeholder="Administrator"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">Email Address</label>
              <Input
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={updateField("adminEmail")}
                placeholder="admin@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">Phone Number</label>
              <Input
                name="adminPhone"
                type="text"
                value={form.adminPhone}
                onChange={updateField("adminPhone")}
                placeholder="+880..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader className="bg-[var(--ad-background)]/30 flex-row items-center justify-between space-y-0 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ad-border)]/20">
              <Shield className="h-5 w-5 text-[var(--ad-text-secondary)]" />
            </div>
            <div>
              <CardTitle className="text-sm">Change Password</CardTitle>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]/30 transition-colors cursor-pointer"
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">Current Password</label>
              <Input
                name="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={form.currentPassword}
                onChange={updateField("currentPassword")}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">New Password</label>
              <Input
                name="newPassword"
                type={showPasswords ? "text" : "password"}
                value={form.newPassword}
                onChange={updateField("newPassword")}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono">Confirm Password</label>
              <Input
                name="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="mt-2 text-xs text-[var(--ad-error)] flex items-center gap-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
            </p>
          )}
          {form.newPassword && form.newPassword.length > 0 && form.newPassword.length < 6 && (
            <p className="mt-2 text-xs text-[var(--ad-warning)] flex items-center gap-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> Password must be at least 6 characters
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[var(--ad-primary)] shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] text-white text-xs uppercase tracking-wider font-bold px-6"
        >
          {pending ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
        {state.status === "success" && (
          <span className="flex items-center gap-1 text-xs text-[var(--ad-success)] font-medium">
            <CheckCircle className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

