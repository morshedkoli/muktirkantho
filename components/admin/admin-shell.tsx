import { Suspense } from "react";
import { AdminToast } from "@/components/admin/admin-toast";

interface AdminShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminShell({ title, description, children, actions }: AdminShellProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ad-text-primary)]">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--ad-text-secondary)]">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
