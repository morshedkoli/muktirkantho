"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { loginAdminAction } from "@/app/(admin)/admin/actions";
import { Field, Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { status: "idle" as const };

interface LoginFormProps {
  logoUrl?: string | null;
  logoHeight?: number | null;
  siteName?: string | null;
}

/**
 * Login is the one admin screen a reader might stumble onto, so it wears the
 * paper's face: the ink slab on the left carries the masthead, the form sits on
 * newsprint at the right. On mobile the slab collapses to a single header band.
 */
export function LoginForm({ logoUrl, logoHeight, siteName }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const height = logoHeight ?? 44;
  const name = siteName ?? "মুক্তির কণ্ঠ";

  return (
    <div className="grid min-h-screen bg-[var(--ad-background)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Masthead slab */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[var(--ad-rail)] px-6 py-8 sm:px-10 lg:py-12">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-[var(--ad-accent)]"
        />

        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={name}
              style={{ height: `${height}px`, width: "auto", maxWidth: "220px" }}
            />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded bg-[var(--ad-accent)] text-[18px] font-bold text-[var(--ad-on-primary)]">
                ম
              </span>
              <span>
                <span className="block font-serif text-[17px] font-bold text-[var(--ad-rail-text)]">
                  {name}
                </span>
                <span className="adm-label block text-[var(--ad-rail-muted)]">
                  Newsroom Console
                </span>
              </span>
            </>
          )}
        </Link>

        <div className="hidden max-w-sm lg:block">
          <p className="font-serif text-[26px] leading-tight text-[var(--ad-rail-text)]">
            আজকের সংবাদ,<br />আজকের কণ্ঠ।
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--ad-rail-muted)]">
            প্রকাশনা, মডারেশন ও কভারেজ — সব এক কনসোল থেকে।
          </p>
        </div>

        <p className="adm-label hidden text-[var(--ad-rail-muted)] lg:block">
          অনুমোদিত সম্পাদকদের জন্য সংরক্ষিত
        </p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="adm-display text-[26px] leading-none">প্রবেশ করুন</h1>
          <p className="mt-2 text-[13px] text-[var(--ad-text-secondary)]">
            অ্যাডমিন কনসোলে যেতে আপনার তথ্য দিন।
          </p>

          <form action={formAction} className="mt-7 space-y-4">
            <Field label="ইমেইল ঠিকানা" htmlFor="login-email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@muktirkantho.com"
                  className="h-10 pl-9"
                />
              </div>
            </Field>

            <Field label="পাসওয়ার্ড" htmlFor="login-password" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ad-text-muted)] transition-colors hover:text-[var(--ad-text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            {state.status === "error" && <Alert tone="error">{state.message}</Alert>}

            <Button type="submit" disabled={pending} size="lg" className="w-full">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  প্রবেশ হচ্ছে…
                </>
              ) : (
                <>
                  প্রবেশ করুন
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ad-text-secondary)] transition-colors hover:text-[var(--ad-accent)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ওয়েবসাইটে ফিরুন
          </Link>
        </div>
      </main>
    </div>
  );
}
