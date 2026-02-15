"use client";

import { useState } from "react";
import { 
  disconnectFacebookAction,
  toggleFacebookAutoPostAction,
  saveFacebookCredentialsAction
} from "@/app/(admin)/admin/actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
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
  Save
} from "lucide-react";

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
    // Redirect to Facebook OAuth
    const redirectUri = `${window.location.origin}/admin/facebook/callback`;
    const params = new URLSearchParams({
      client_id: settings.appId || "",
      redirect_uri: redirectUri,
      scope: "pages_manage_posts,pages_read_engagement,pages_show_list",
      response_type: "code",
      state: Math.random().toString(36).substring(7),
    });
    
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
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
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>Credentials configured successfully</span>
          </div>
        )}

        {!showCredentialsForm && !isConfigured && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>Please configure your Facebook App credentials to enable integration</span>
          </div>
        )}

        {showCredentialsForm && (
          <form onSubmit={handleSaveCredentials} className="space-y-4 mt-4">
            {credentialsMessage.status === "error" && credentialsMessage.message && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
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
                className="flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Credentials
              </button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
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
              ? "border-emerald-200 bg-emerald-50" 
              : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  settings.connected ? "bg-emerald-100" : "bg-gray-200"
                }`}>
                  <Facebook className={`h-6 w-6 ${
                    settings.connected ? "text-emerald-600" : "text-gray-500"
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
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              ) : (
                <button
                  onClick={handleConnect}
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
                        <ToggleRight className="h-10 w-10 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-10 w-10 text-gray-400" />
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Disconnect Button */}
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-rose-900">Disconnect Facebook</h3>
                    <p className="text-sm text-rose-700 mt-1">
                      This will remove the connection to your Facebook page
                    </p>
                  </div>
                  
                  <form action={disconnectFacebookAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
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
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-white">
              1
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Enter your Facebook App credentials above
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-white">
              2
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Connect your Facebook page using the button
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-white">
              3
            </div>
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Enable &quot;Auto-Share to Facebook&quot; to automatically post new news articles
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-xs font-bold text-white">
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
