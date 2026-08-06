import {
  Users,
  Shield,
  UserPlus,
  Trash2,
  Power,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState, Field } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

type RoleKey = "Super Admin" | "Editor" | "Reporter" | "Contributor";

const roles: Record<
  RoleKey,
  { label: string; variant: "accent" | "info" | "success" | "warning"; permissions: string[] }
> = {
  "Super Admin": {
    label: "সুপার অ্যাডমিন",
    variant: "accent",
    permissions: ["সম্পূর্ণ সিস্টেম অ্যাক্সেস", "ব্যবহারকারী ব্যবস্থাপনা", "সেটিংস পরিবর্তন"],
  },
  Editor: {
    label: "সম্পাদক",
    variant: "info",
    permissions: ["সংবাদ প্রকাশ", "সব পোস্ট সম্পাদনা", "মন্তব্য মডারেশন"],
  },
  Reporter: {
    label: "প্রতিবেদক",
    variant: "success",
    permissions: ["সংবাদ তৈরি", "নিজের পোস্ট সম্পাদনা", "মিডিয়া আপলোড"],
  },
  Contributor: {
    label: "অবদানকারী",
    variant: "warning",
    permissions: ["শুধু খসড়া তৈরি"],
  },
};

function roleOf(role: string) {
  return roles[role as RoleKey] ?? roles.Reporter;
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalArticles = users.reduce((sum, u) => sum + u.articles, 0);
  const avgArticles = users.length > 0 ? Math.round(totalArticles / users.length) : 0;

  return (
    <TooltipProvider>
      <AdminShell
        kicker="সিস্টেম"
        title="দল ও অনুমতি"
        description="নিউজরুমের সদস্য, তাদের ভূমিকা এবং প্রকাশনার অবদান।"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatTile label="মোট সদস্য" value={bnNumber(users.length)} icon={Users} />
          <StatTile
            label="সক্রিয়"
            value={bnNumber(activeUsers)}
            hint={
              users.length
                ? `${bnNumber(Math.round((activeUsers / users.length) * 100))}% সক্রিয়`
                : undefined
            }
            tone="success"
            icon={CheckCircle2}
          />
          <StatTile
            label="মোট নিবন্ধ"
            value={bnNumber(totalArticles)}
            tone="info"
            icon={FileText}
          />
          <StatTile
            label="গড় নিবন্ধ"
            value={bnNumber(avgArticles)}
            hint="প্রতি সদস্যে"
            icon={FileText}
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Panel
              flush
              kicker="দল"
              title="সদস্য তালিকা"
              actions={
                <span className="adm-label">
                  {bnNumber(activeUsers)} সক্রিয় · {bnNumber(users.length - activeUsers)} নিষ্ক্রিয়
                </span>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[42%] pl-5">সদস্য</TableHead>
                    <TableHead className="w-[18%]">ভূমিকা</TableHead>
                    <TableHead className="w-[12%]">নিবন্ধ</TableHead>
                    <TableHead className="w-[14%]">অবস্থা</TableHead>
                    <TableHead className="w-[14%] pr-5 text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="p-0">
                        <EmptyState
                          icon={Users}
                          title="কোনো সদস্য নেই"
                          description="ডান পাশের ফর্ম থেকে প্রথম সদস্যকে আমন্ত্রণ জানান।"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const role = roleOf(user.role);
                      const isActive = user.status === "active";
                      const toggleStatus = toggleUserStatusAction.bind(null, user.id);
                      const removeUser = removeUserAction.bind(null, user.id);

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ad-border)] bg-[var(--ad-inset)] text-[11px] font-semibold text-[var(--ad-text-secondary)]">
                                {user.avatar || user.name.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-[var(--ad-text-primary)]">
                                  {user.name}
                                </p>
                                <p className="adm-mono truncate text-[11px] text-[var(--ad-text-muted)]">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.variant}>{role.label}</Badge>
                          </TableCell>
                          <TableCell className="adm-mono text-[13px] font-semibold">
                            {bnNumber(user.articles)}
                          </TableCell>
                          <TableCell>
                            <Badge dot variant={isActive ? "success" : "secondary"}>
                              {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-5">
                            <div className="flex items-center justify-end gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <form action={toggleStatus}>
                                    <Button
                                      type="submit"
                                      variant="icon"
                                      size="icon"
                                      aria-label={isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                                    >
                                      <Power className="h-4 w-4" />
                                    </Button>
                                  </form>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <form action={removeUser}>
                                    <Button
                                      type="submit"
                                      variant="icon"
                                      size="icon"
                                      aria-label="সদস্য সরান"
                                      className="hover:bg-[var(--ad-error-tint)] hover:text-[var(--ad-error)]"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </form>
                                </TooltipTrigger>
                                <TooltipContent>সদস্য সরান</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Panel>

            {/* Role reference */}
            <Panel kicker="রেফারেন্স" title="ভূমিকা ও অনুমতি">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(roles) as RoleKey[]).map((key) => {
                  const role = roles[key];
                  const count = users.filter((u) => u.role === key).length;
                  return (
                    <div
                      key={key}
                      className="rounded-[var(--ad-radius-sm)] border border-[var(--ad-border)] p-3.5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ad-text-primary)]">
                          <Shield className="h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
                          {role.label}
                        </span>
                        <span className="adm-mono text-[11px] text-[var(--ad-text-muted)]">
                          {bnNumber(count)}
                        </span>
                      </div>
                      <ul className="space-y-1.5 border-t border-[var(--ad-border)] pt-3">
                        {role.permissions.map((permission) => (
                          <li
                            key={permission}
                            className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--ad-text-secondary)]"
                          >
                            <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--ad-accent)]" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Invite */}
          <Panel
            kicker="নতুন সদস্য"
            title="আমন্ত্রণ পাঠান"
            className="xl:sticky xl:top-20"
          >
            <form
              action={async (formData) => {
                "use server";
                await inviteUserAction({ status: "idle" }, formData);
              }}
              className="space-y-4"
            >
              <Field label="পূর্ণ নাম" htmlFor="invite-name" required>
                <Input
                  id="invite-name"
                  name="name"
                  type="text"
                  required
                  placeholder="যেমন: মোরশেদ আলী"
                />
              </Field>

              <Field label="ইমেইল" htmlFor="invite-email" required>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@muktirkantho.com"
                />
              </Field>

              <Field label="ভূমিকা" htmlFor="invite-role">
                <Select id="invite-role" name="role" defaultValue="Reporter">
                  {(Object.keys(roles) as RoleKey[]).map((key) => (
                    <option key={key} value={key}>
                      {roles[key].label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4" />
                আমন্ত্রণ পাঠান
              </Button>
            </form>
          </Panel>
        </div>
      </AdminShell>
    </TooltipProvider>
  );
}
