"use client";

import { useState, useTransition } from "react";
import {
  beginFacebookConnectAction,
  disconnectFacebookAction,
  toggleFacebookAutoPostAction,
  saveFacebookCredentialsAction,
  verifyFacebookConnectionAction
} from "@/app/(admin)/admin/actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/admin/toast-provider";
import {
  Facebook,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Unlink,
  Key,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ShieldCheck
} from "lucide-react";

/** Asks Facebook whether the stored page token still works. */
function VerifyConnectionButton() {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await verifyFacebookConnectionAction();
          showToast(result.message ?? "", result.status === "success" ? "success" : "error");
        })
      }
      className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--ad-border-strong)] bg-[var(--ad-card)] px-4 py-2 text-sm font-semibold text-[var(--ad-text-primary)] transition-colors hover:bg-[var(--ad-inset)] disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4" />
      )}
      {pending ? "Checking…" : "Check now"}
    </button>
  );
}

interface FacebookConnectClientProps {
  settings: {
    connected: boolean;
    pageId: string | null;
    pageName: string | null;
    autoPost: boolean;
    connectedAt: Date | null;
    appId: string | null;
  };
  isConfigured: boolean;
}

export function FacebookConnectClient({ settings, isConfigured }: FacebookConnectClientProps) {
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [credentialsState, setCredentialsState] = useState({
    appId: settings.appId || "",
    appSecret: "",
  });
  const [credentialsMessage, setCredentialsMessage] = useState<AdminActionState>({ status: "idle" });

  const handleConnect = async () => {
    // The OAuth URL is built server-side so the CSRF `state` can be random and
    // stored in an httpOnly cookie the callback can verify.
    const result = await beginFacebookConnectAction();
    if ("url" in result) {
      window.location.href = result.url;
      return;
    }
    setCredentialsMessage(result);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage({ status: "idle" });
    
    const formData = new FormData();
    formData.append("facebookAppId", credentialsState.appId);
    formData.append("facebookAppSecret", credentialsState.appSecret);
    
    const result = await saveFacebookCredentialsAction({ status: "idle" }, formData);
    setCredentialsMessage(result);
    
    if (result.status === "success") {
      // Reload page to reflect changes
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Credentials Configuration Section */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--ad-primary)]/10">
              <Key className="h-5 w-5 text-[var(--ad-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
                Facebook App Credentials
              </h2>
              <p className="text-sm text-[var(--ad-text-secondary)]">
                Configure your Facebook App ID and Secret
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCredentialsForm(!showCredentialsForm)}
            className="text-sm font-medium text-[var(--ad-primary)] hover:underline"
          >
            {showCredentialsForm ? "Cancel" : isConfigured ? "Edit Credentials" : "Set Credentials"}
          </button>
        </div>

        {!showCredentialsForm && isConfigured && (
          <div className="flex items-center gap-2 text-sm text-[var(--ad-success)] bg-[var(--ad-success)]/10 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>Credentials configured successfully</span>
          </div>
        )}

        {!showCredentialsForm && !isConfigured && (
          <div className="flex items-center gap-2 text-sm text-[var(--ad-warning)] bg-[var(--ad-warning)]/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>Please configure your Facebook App credentials to enable integration</span>
          </div>
        )}

        {showCredentialsForm && (
          <form onSubmit={handleSaveCredentials} className="space-y-4 mt-4">
            {credentialsMessage.status === "error" && credentialsMessage.message && (
              <div className="rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-4 py-3 text-sm text-[var(--ad-error)]">
                {credentialsMessage.message}
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={credentialsState.appId}
                  onChange={(e) => setCredentialsState({ ...credentialsState, appId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none"
                  required
                />
                <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">
                  Find this in your Facebook App Dashboard → Settings → Basic
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2">
                  Facebook App Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={credentialsState.appSecret}
                    onChange={(e) => setCredentialsState({ ...credentialsState, appSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">
                  Keep this secret! Never share it publicly.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-on-primary)] hover:bg-[var(--ad-primary-hover)] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Credentials
              </button>
            </div>

            <div className="rounded-lg border border-[var(--ad-primary)]/20 bg-[var(--ad-primary)]/10 p-4 text-sm text-[var(--ad-primary)]">
              <p className="font-medium mb-1">How to get these credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                <li>Create a new app or select an existing one</li>
                <li>Go to Settings → Basic</li>
                <li>Copy the App ID and App Secret</li>
                <li>Make sure your app has the &quot;pages_manage_posts&quot; permission</li>
              </ol>
            </div>
          </form>
        )}
      </div>

      {/* Connection Status */}
      {isConfigured && (
        <>
          <div className={`rounded-xl border p-6 ${
            settings.connected 
              ? "border-[var(--ad-success)]/20 bg-[var(--ad-success)]/10" 
              : "border-[var(--ad-border)] bg-[var(--ad-paper)]"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  settings.connected ? "bg-[var(--ad-success)]/10" : "bg-[var(--ad-border)]"
                }`}>
                  <Facebook className={`h-6 w-6 ${
                    settings.connected ? "text-[var(--ad-success)]" : "text-[var(--ad-text-secondary)]"
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ad-text-primary)]">
                    {settings.connected ? "Connected to Facebook" : "Not Connected"}
                  </h3>
                  {settings.connected && settings.pageName && (
                    <p className="text-sm text-[var(--ad-text-secondary)]">
                      Page: <span className="font-medium">{settings.pageName}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {settings.connected ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[var(--ad-success)]" />
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  /* Facebook brand blue is fixed in both themes, so its
                     foreground stays literal white rather than a theme token. */
                  className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166fe5] transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                  Connect Facebook Page
                </button>
              )}
            </div>
          </div>

          {/* Connected Page Details */}
          {settings.connected && (
            <>
              <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
                <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
                  Connected Page
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--ad-background)] rounded-lg">
                    <div>
                      <p className="text-sm text-[var(--ad-text-secondary)]">Page Name</p>
                      <p className="font-medium text-[var(--ad-text-primary)]">{settings.pageName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--ad-text-secondary)]">Page ID</p>
                      <p className="font-medium text-[var(--ad-text-primary)]">{settings.pageId}</p>
                    </div>
                  </div>

                  {settings.connectedAt && (
                    <p className="text-xs text-[var(--ad-text-secondary)]">
                      Connected on {new Date(settings.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Auto-Post Toggle */}
              <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ad-text-primary)]">
                      Auto-Share to Facebook
                    </h3>
                    <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
                      Automatically share new posts to your Facebook page when published
                    </p>
                  </div>
                  
                  <form action={toggleFacebookAutoPostAction}>
                    <button
                      type="submit"
                      className="p-2 transition-transform hover:scale-105"
                    >
                      {settings.autoPost ? (
                        <ToggleRight className="h-10 w-10 text-[var(--ad-success)]" />
                      ) : (
                        <ToggleLeft className="h-10 w-10 text-[var(--ad-muted)]" />
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Connection health.
                  `facebookConnected` is only a flag in our own database — it
                  says nothing about whether Facebook still honours the stored
                  token. This asks Facebook, and clears the flag if the answer
                  is no, so a dead connection stops advertising itself as live. */}
              <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--ad-text-primary)]">
                      Check connection
                    </h3>
                    <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
                      Verify the saved page token still works for posting
                    </p>
                  </div>
                  <VerifyConnectionButton />
                </div>
              </div>

              {/* Disconnect Button */}
              <div className="rounded-xl border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--ad-error)]">Disconnect Facebook</h3>
                    <p className="text-sm text-[var(--ad-error)] mt-1">
                      This will remove the connection to your Facebook page
                    </p>
                  </div>
                  
                  <form action={disconnectFacebookAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg border border-[var(--ad-error)]/30 bg-[var(--ad-card)] px-4 py-2 text-sm font-semibold text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 transition-colors"
                    >
                      <Unlink className="h-4 w-4" />
                      Disconnect
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* How It Works */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)]">
        <h3 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">
          How It Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-[var(--ad-on-primary)]">
              1
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Enter your Facebook App credentials above
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-[var(--ad-on-primary)]">
              2
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Connect your Facebook page using the button
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-[var(--ad-on-primary)]">
              3
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Enable &quot;Auto-Share to Facebook&quot; to automatically post new news articles
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-[var(--ad-on-primary)]">
              4
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              When you publish a post, it will be automatically shared to your Facebook page with the featured image
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
