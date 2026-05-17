import { AdminShell } from "@/components/admin/admin-shell";
import { Users, Shield, UserPlus, Edit2, Ban, Search, Mail, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

const users = [
  { name: "Shahidul Islam", email: "shahidul@muktirkantho.com", role: "Super Admin", status: "active", articles: 342, lastActive: "2 min ago", avatar: "SI" },
  { name: "Fatima Rahman", email: "fatima@muktirkantho.com", role: "Editor", status: "active", articles: 198, lastActive: "15 min ago", avatar: "FR" },
  { name: "Kabir Hossain", email: "kabir@muktirkantho.com", role: "Reporter", status: "active", articles: 156, lastActive: "1 hr ago", avatar: "KH" },
  { name: "Nusrat Jahan", email: "nusrat@muktirkantho.com", role: "Reporter", status: "active", articles: 134, lastActive: "3 hrs ago", avatar: "NJ" },
  { name: "Rafiq Ahmed", email: "rafiq@muktirkantho.com", role: "Contributor", status: "active", articles: 45, lastActive: "1 day ago", avatar: "RA" },
  { name: "Ayesha Begum", email: "ayesha@muktirkantho.com", role: "Contributor", status: "inactive", articles: 12, lastActive: "2 weeks ago", avatar: "AB" },
];

const roleConfig: Record<string, { icon: typeof Shield; color: string; badge: string; perms: string[] }> = {
  "Super Admin": { icon: Shield, color: "text-[var(--ad-error)]", badge: "bg-[var(--ad-error)]/10 text-[var(--ad-error)]", perms: ["Full system access", "User management", "Content publishing", "Settings"] },
  "Editor": { icon: Shield, color: "text-[var(--ad-primary)]", badge: "bg-[var(--ad-primary)]/10 text-[var(--ad-primary)]", perms: ["Content management", "Publish articles", "Media library", "Comments"] },
  "Reporter": { icon: Users, color: "text-[var(--ad-success)]", badge: "bg-[var(--ad-success)]/10 text-[var(--ad-success)]", perms: ["Create articles", "Edit own", "Upload media"] },
  "Contributor": { icon: Users, color: "text-[var(--ad-warning)]", badge: "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]", perms: ["Create articles only"] },
};

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, class: "bg-[var(--ad-success)]/10 text-[var(--ad-success)]" },
  inactive: { label: "Inactive", icon: XCircle, class: "bg-[var(--ad-muted)]/10 text-[var(--ad-muted)]" },
};

function Avatar({ name, initials }: { name: string; initials: string }) {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-purple-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ];
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colors[colorIndex]} text-xs font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const activeUsers = users.filter(u => u.status === "active").length;
  const totalArticles = users.reduce((sum, u) => sum + u.articles, 0);

  return (
    <AdminShell
      title="Users & Roles"
      description="Manage team members, assign roles, and track editorial activity"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ad-primary-hover)] transition-all">
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, icon: Users, change: "+2 this month" },
          { label: "Active", value: activeUsers, icon: CheckCircle, change: `${Math.round(activeUsers / users.length * 100)}% active` },
          { label: "Total Articles", value: totalArticles, icon: FileText, change: "All time" },
          { label: "Avg Articles/User", value: Math.round(totalArticles / users.length), icon: Clock, change: "Per contributor" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">{s.label}</p>
                <Icon className="h-4 w-4 text-[var(--ad-text-secondary)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--ad-text-primary)]">{s.value.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--ad-text-secondary)] mt-0.5">{s.change}</p>
            </div>
          );
        })}
      </div>

      {/* Role Templates */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-[var(--ad-text-secondary)]" />
          <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">Role Templates</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(roleConfig).map(([role, config]) => {
            const Icon = config.icon;
            return (
              <div key={role} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 hover:border-[var(--ad-text-primary)] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${config.color} bg-[var(--ad-paper)] flex h-9 w-9 items-center justify-center rounded-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ad-text-primary)]">{role}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.badge}`}>
                      {users.filter(u => u.role === role).length} users
                    </span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {config.perms.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-[11px] text-[var(--ad-text-secondary)]">
                      <span className="h-1 w-1 rounded-full bg-[var(--ad-text-secondary)] shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--ad-border)] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] pl-9 pr-4 py-2 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--ad-text-secondary)]">
            <Mail className="h-3.5 w-3.5" />
            <span>{users.filter(u => u.status === "active").length} active · {users.filter(u => u.status === "inactive").length} inactive</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-border)] bg-[var(--ad-paper)]">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">User</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">Role</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">Articles</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)]">Last Active</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ad-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ad-border)]">
              {users.map((user) => {
                const roleConf = roleConfig[user.role];
                const statConf = statusConfig[user.status as keyof typeof statusConfig];
                const StatusIcon = statConf.icon;
                return (
                  <tr key={user.email} className="hover:bg-[var(--ad-paper)]/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} initials={user.avatar} />
                        <div>
                          <p className="text-sm font-medium text-[var(--ad-text-primary)]">{user.name}</p>
                          <p className="text-xs text-[var(--ad-text-secondary)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${roleConf.badge}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-lg font-bold text-[var(--ad-text-primary)]">{user.articles}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${statConf.class}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--ad-text-secondary)]">{user.lastActive}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper-2)] rounded-lg transition-colors" title="Edit user">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {user.status === "active" ? (
                          <button className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-warning)] hover:bg-[var(--ad-warning)]/10 rounded-lg transition-colors" title="Deactivate user">
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 rounded-lg transition-colors" title="Remove user">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
