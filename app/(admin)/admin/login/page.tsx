"use client";

import { useActionState } from "react";
import { loginAdminAction } from "@/app/(admin)/admin/actions";
import { Lock, Mail, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const initialState = { status: "idle" as const };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--ad-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ad-primary)] shadow-xl shadow-blue-900/20 mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ad-text-primary)]">
              <span className="font-bangla text-[var(--ad-primary)]">মুক্তির কণ্ঠ</span>
            </h1>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-1">Admin Portal</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-[var(--ad-card)] shadow-xl border border-[var(--ad-border)] overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-xl font-semibold text-[var(--ad-text-primary)]">Welcome back</h2>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-1">Sign in to access the admin dashboard</p>
          </div>

          <div className="px-8 pb-8">
            <form action={formAction} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ad-text-secondary)]" />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@muktirkantho.com"
                    className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] pl-10 pr-4 py-2.5 text-sm outline-none text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-secondary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ad-text-secondary)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] pl-10 pr-10 py-2.5 text-sm outline-none text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-secondary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {state.status === "error" && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-rose-600 text-xs">!</span>
                  </div>
                  <p className="text-sm text-rose-800">{state.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={pending}
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
              >
                {pending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] transition-colors"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
