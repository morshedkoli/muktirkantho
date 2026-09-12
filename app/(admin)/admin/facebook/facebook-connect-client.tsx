"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  beginFacebookConnectAction,
  connectFacebookDirectAction,
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
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const { showToast } = useToast();

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [credentialsState, setCredentialsState] = useState({
    appId: settings.appId || "",
    appSecret: "",
  });
  const [credentialsMessage, setCredentialsMessage] = useState<AdminActionState>({ status: "idle" });

  const [showDirectConnect, setShowDirectConnect] = useState(false);
  const [directForm, setDirectForm] = useState({ pageId: "", pageAccessToken: "" });
  const [directPending, setDirectPending] = useState(false);
  const [directMessage, setDirectMessage] = useState<AdminActionState>({ status: "idle" });
  const [showDirectToken, setShowDirectToken] = useState(false);

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

  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectMessage({ status: "idle" });
    setDirectPending(true);

    const formData = new FormData();
    formData.append("pageId", directForm.pageId);
    formData.append("pageAccessToken", directForm.pageAccessToken);

    try {
      const result = await connectFacebookDirectAction({ status: "idle" }, formData);
      setDirectMessage(result);
      if (result.status === "success") {
        showToast(result.message ?? "Connected successfully", "success");
        window.location.reload();
      } else {
        showToast(result.message ?? "Connection failed", "error");
      }
    } catch (err) {
      setDirectMessage({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to connect",
      });
    } finally {
      setDirectPending(false);
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

      {/* URL Callback Error Banner */}
      {urlError && (
        <div className="rounded-xl border border-[var(--ad-error)]/30 bg-[var(--ad-error)]/10 p-4 text-sm text-[var(--ad-error)] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Facebook Connection Error</p>
            <p>{urlError}</p>
            <p className="text-xs opacity-90 mt-1">
              Tip: If you are encountering permissions or domain restrictions, you can use the <strong>Direct Page Token</strong> connection below.
            </p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {isConfigured && (
        <>
          <div className={`rounded-xl border p-6 ${
            settings.connected 
              ? "border-[var(--ad-success)]/20 bg-[var(--ad-success)]/10" 
              : "border-[var(--ad-border)] bg-[var(--ad-paper)]"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166fe5] transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    Connect via Facebook Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDirectConnect(!showDirectConnect)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-border-strong)] bg-[var(--ad-card)] px-3.5 py-2 text-xs font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-inset)] transition-colors"
                  >
                    <Key className="h-3.5 w-3.5 text-[var(--ad-primary)]" />
                    {showDirectConnect ? "Close Token Form" : "Connect via Page Token (Direct)"}
                  </button>
                </div>
              )}
            </div>

            {/* Direct Page Connection Form */}
            {!settings.connected && showDirectConnect && (
              <div className="mt-6 pt-5 border-t border-[var(--ad-border)] space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-[var(--ad-primary)]" />
                  <h4 className="text-sm font-semibold text-[var(--ad-text-primary)]">
                    Connect Directly with Page Access Token
                  </h4>
                </div>
                <p className="text-xs text-[var(--ad-text-secondary)]">
                  Use this option to connect your Facebook Page directly using a Page Access Token (Permanent Token). This bypasses OAuth redirects and development-mode restrictions.
                </p>

                {directMessage.status === "error" && directMessage.message && (
                  <div className="rounded-lg border border-[var(--ad-error)]/20 bg-[var(--ad-error)]/10 px-4 py-3 text-xs text-[var(--ad-error)] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{directMessage.message}</span>
                  </div>
                )}

                <form onSubmit={handleDirectConnect} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1">
                        Facebook Page ID
                      </label>
                      <input
                        type="text"
                        value={directForm.pageId}
                        onChange={(e) => setDirectForm({ ...directForm, pageId: e.target.value })}
                        placeholder="e.g. 104829104829104"
                        className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] outline-none"
                        required
                      />
                      <p className="mt-1 text-[11px] text-[var(--ad-text-secondary)]">
                        Your Facebook Page ID (numeric)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--ad-text-primary)] mb-1">
                        Page Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showDirectToken ? "text" : "password"}
                          value={directForm.pageAccessToken}
                          onChange={(e) => setDirectForm({ ...directForm, pageAccessToken: e.target.value })}
                          placeholder="EAA..."
                          className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-primary)] outline-none pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowDirectToken(!showDirectToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                        >
                          {showDirectToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--ad-text-secondary)]">
                        Generated with pages_manage_posts and pages_read_engagement permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-[var(--ad-text-secondary)]">
                      The token will be verified against Facebook Graph API before connecting.
                    </p>
                    <button
                      type="submit"
                      disabled={directPending}
                      className="flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2 text-sm font-semibold text-[var(--ad-on-primary)] hover:bg-[var(--ad-primary-hover)] transition-colors disabled:opacity-60 shrink-0"
                    >
                      {directPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {directPending ? "Verifying with Facebook…" : "Connect Page"}
                    </button>
                  </div>
                </form>

                <div className="rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] p-3 text-xs text-[var(--ad-text-secondary)] space-y-1">
                  <p className="font-semibold text-[var(--ad-text-primary)]">How to get a Page Access Token:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-[var(--ad-primary)] underline">Meta Graph API Explorer</a>.</li>
                    <li>Select your Meta App (<strong>Muktirkantho</strong>).</li>
                    <li>Under &quot;User or Page&quot;, choose &quot;Get Page Access Token&quot; and pick your page.</li>
                    <li>Ensure permissions include <code>pages_manage_posts</code> and <code>pages_read_engagement</code>.</li>
                    <li>Generate Access Token, copy the Token and Page ID, and paste them above.</li>
                  </ol>
                </div>
              </div>
            )}
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
