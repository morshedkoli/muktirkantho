interface AdminShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminShell({ title, description, children, actions }: AdminShellProps) {
  return (
    <div className="space-y-6 admin-content-area">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 border-b border-[var(--ad-border)] pb-5">
        <div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl font-bold text-[var(--ad-text-primary)] leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-[var(--ad-text-secondary)] max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
