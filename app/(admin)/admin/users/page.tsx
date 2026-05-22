import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { Users, Shield, UserPlus, Trash2, Ban, Search, Mail, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { inviteUserAction, toggleUserStatusAction, removeUserAction } from "../actions";

export const dynamic = "force-dynamic";

const roleConfig: Record<string, { icon: typeof Shield; color: string; badge: string; perms: string[] }> = {
  "Super Admin": { icon: Shield, color: "text-[var(--ad-brand)]", badge: "bg-[var(--ad-brand-light)] text-[var(--ad-brand)]", perms: ["Full system access", "User management", "Content publishing", "Settings"] },
  "Editor": { icon: Shield, color: "text-[var(--ad-primary)]", badge: "bg-[var(--ad-green-light)] text-[var(--ad-primary)]", perms: ["Content management", "Publish articles", "Media library", "Comments"] },
  "Reporter": { icon: Users, color: "text-[var(--ad-success)]", badge: "bg-[var(--ad-green-light)] text-[var(--ad-success)]", perms: ["Create articles", "Edit own", "Upload media"] },
  "Contributor": { icon: Users, color: "text-[var(--ad-amber)]", badge: "bg-[var(--ad-amber-light)] text-[var(--ad-amber)]", perms: ["Create articles only"] },
};

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, class: "bg-[var(--ad-green-light)] text-[var(--ad-green)]" },
  inactive: { label: "Inactive", icon: XCircle, class: "bg-[var(--ad-border)]/45 text-[var(--ad-text-secondary)]" },
};

function Avatar({ name, initials }: { name: string; initials: string }) {
  const hexColors = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#6366f1"];
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % hexColors.length;
  return (
    <div
      className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0 shadow-sm border border-white/10"
      style={{ backgroundColor: hexColors[colorIndex] }}
    >
      {initials}
    </div>
  );
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalArticles = users.reduce((sum, u) => sum + u.articles, 0);

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in-up">
        <AdminShell
          title="Users & Roles"
          description="Manage team members, assign roles, and track real editorial database statistics."
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: users.length, icon: Users, change: "Registered accounts" },
              { label: "Active Members", value: activeUsers, icon: CheckCircle, change: `${users.length ? Math.round(activeUsers / users.length * 100) : 0}% active` },
              { label: "Total Articles", value: totalArticles, icon: FileText, change: "Dynamic post attribution" },
              { label: "Avg Articles", value: users.length ? Math.round(totalArticles / users.length) : 0, icon: Clock, change: "Per team member" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)]">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[var(--ad-background)] text-[var(--ad-text-muted)] border border-[var(--ad-border)] shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">{s.label}</p>
                      <p className="text-2xl font-black text-[var(--ad-text-primary)] leading-none mt-1.5 tracking-tight">{s.value.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-[var(--ad-text-muted)] mt-1.5 font-mono uppercase tracking-wider">{s.change}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="space-y-6">
              {/* Users Table */}
              <Card className="overflow-hidden shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)] rounded-xl">
                <div className="border-b border-[var(--ad-border)] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--ad-background)]/30">
                  <div className="relative flex-1 max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-muted)] pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search members..."
                      className="pl-9 h-8.5 rounded-lg border-[var(--ad-border)] bg-[var(--ad-paper)] focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ad-text-muted)]">
                    <Mail className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{users.filter(u => u.status === "active").length} active · {users.filter(u => u.status === "inactive").length} inactive</span>
                  </div>
                </div>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6 w-[40%]">User</TableHead>
                        <TableHead className="w-[20%]">Role</TableHead>
                        <TableHead className="w-[15%]">Articles</TableHead>
                        <TableHead className="w-[15%] font-center">Status</TableHead>
                        <TableHead className="pr-6 w-[10%] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const roleConf = roleConfig[user.role] || roleConfig["Reporter"];
                        const statConf = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.active;
                        const StatusIcon = statConf.icon;
                        const toggleStatus = toggleUserStatusAction.bind(null, user.id);
                        const removeUser = removeUserAction.bind(null, user.id);

                        return (
                          <TableRow key={user.email} className="group hover:bg-[var(--ad-paper)]/30">
                            <TableCell className="pl-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={user.name} initials={user.avatar} />
                                <div className="min-w-0">
                                  <p className="text-[13.5px] font-bold text-[var(--ad-text-primary)] leading-tight truncate">{user.name}</p>
                                  <p className="text-[11.5px] text-[var(--ad-text-muted)] leading-normal mt-0.5 truncate">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${roleConf.badge}`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <span className="font-mono text-sm font-bold text-[var(--ad-text-primary)]">{user.articles}</span>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded shrink-0 ${statConf.class}`}>
                                <StatusIcon className="h-3 w-3" />
                                {statConf.label}
                              </span>
                            </TableCell>
                            <TableCell className="pr-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <form action={toggleStatus}>
                                      <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-emerald-50 text-[var(--ad-text-muted)] hover:text-emerald-600"
                                      >
                                        <Ban className="h-3.5 w-3.5" />
                                      </Button>
                                    </form>
                                  </TooltipTrigger>
                                  <TooltipContent>Toggle Status (Active/Inactive)</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <form action={removeUser}>
                                      <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-rose-50 text-[var(--ad-text-muted)] hover:text-rose-600"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </form>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Member</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-[var(--ad-text-muted)] text-sm">
                            No team members found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Role Templates */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--ad-text-muted)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Role Templates & Permissions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon;
                    return (
                      <Card key={role} className="hover:border-emerald-500/30 transition-all duration-300 shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)]">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`${config.color} bg-[var(--ad-background)] flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-[var(--ad-border)] shrink-0`}>
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-[var(--ad-text-primary)] leading-tight truncate">{role}</p>
                              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 inline-block shrink-0 ${config.badge}`}>
                                {users.filter(u => u.role === role).length} users
                              </span>
                            </div>
                          </div>
                          <ul className="space-y-1.5 border-t border-[var(--ad-border)] pt-3">
                            {config.perms.map((perm) => (
                              <li key={perm} className="flex items-center gap-1.5 text-[11px] text-[var(--ad-text-secondary)]">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">{perm}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Invite Form Card */}
            <Card className="shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)] rounded-xl sticky top-6">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--ad-border)]">
                  <UserPlus className="h-4.5 w-4.5 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Invite Member</h3>
                </div>
                <form
                  action={async (formData) => {
                    "use server";
                    await inviteUserAction({ status: "idle" }, formData);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">Full Name</label>
                    <Input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Morshed Koli"
                      className="h-9.5 rounded-lg border-[var(--ad-border)] bg-[var(--ad-paper)] focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">Email Address</label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="name@muktirkantho.com"
                      className="h-9.5 rounded-lg border-[var(--ad-border)] bg-[var(--ad-paper)] focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">System Role</label>
                    <select
                      name="role"
                      className="w-full h-9.5 px-3 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] text-sm text-[var(--ad-text-primary)] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      defaultValue="Reporter"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Reporter">Reporter</option>
                      <option value="Contributor">Contributor</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full h-9.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold font-mono uppercase tracking-wider text-xs">
                    Send Invitation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </AdminShell>
      </div>
    </TooltipProvider>
  );
}
