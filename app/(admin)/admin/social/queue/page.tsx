import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { Facebook, Zap, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostStatus } from "@prisma/client";
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
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SocialQueuePage() {
  const [posts, settings] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, title: true, status: true, publishedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findFirst(),
  ]);

  const pending = posts.filter((p) => p.status === PostStatus.draft).length;
  const sent = posts.filter((p) => p.status === PostStatus.published).length;
  const facebookConnected = settings?.facebookConnected ?? false;

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in-up">
        <AdminShell
          title="Social Queue"
          description="Manage automated sharing schedules, connected accounts, and queued broadcasts."
          actions={
            <Button asChild size="sm" variant="default">
              <Link href="/admin/facebook">
                <Facebook className="h-4 w-4" />
                Facebook Settings
              </Link>
            </Button>
          }
        >
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending (Drafts)", value: pending, icon: Clock, bg: "bg-[var(--ad-amber-light)]", fg: "text-[var(--ad-amber)]" },
              { label: "Sent / Published", value: sent, icon: CheckCircle, bg: "bg-[var(--ad-green-light)]", fg: "text-[var(--ad-green)]" },
              { label: "Platform Status", value: facebookConnected ? "Active" : "Disconnected", icon: facebookConnected ? CheckCircle : AlertTriangle, bg: facebookConnected ? "bg-[var(--ad-green-light)]" : "bg-[var(--ad-brand-light)]", fg: facebookConnected ? "text-[var(--ad-green)]" : "text-[var(--ad-brand)]" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)]">
                  <CardContent className="p-5 flex items-center gap-3.5">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.fg} border border-transparent`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">{s.label}</p>
                      <p className="text-xl font-black text-[var(--ad-text-primary)] leading-none mt-1 tracking-tight">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Queue Table */}
          <Card className="overflow-hidden shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)] rounded-xl">
            <div className="border-b border-[var(--ad-border)] px-5 py-3.5 bg-[var(--ad-background)]/30">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Facebook Auto-post Integration Queue</h2>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[45%]">Article Title</TableHead>
                    <TableHead className="w-[20%]">Publish Target</TableHead>
                    <TableHead className="w-[20%]">Status Date</TableHead>
                    <TableHead className="pr-6 w-[15%]">Transmission Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.slice(0, 15).map((item) => {
                    const isPublished = item.status === PostStatus.published;
                    return (
                      <TableRow key={item.id} className="group hover:bg-[var(--ad-paper)]/30">
                        <TableCell className="pl-6 font-bangla font-bold text-[13px] text-[var(--ad-text-primary)]">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#1877f2] flex h-6 w-6 items-center justify-center rounded text-white shadow-sm shrink-0">
                              <Facebook className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[var(--ad-text-secondary)]">Facebook Page</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] font-bold text-[var(--ad-text-secondary)]">
                          {format(new Date(item.publishedAt || item.createdAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="pr-6">
                          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isPublished
                              ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] border-[var(--ad-green)]/15"
                              : "bg-[var(--ad-amber-light)] text-[var(--ad-amber)] border-[var(--ad-amber)]/15"
                          }`}>
                            {isPublished ? "Sent / Posted" : "Pending Draft"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-[var(--ad-text-muted)] text-sm">
                        No articles configured in publishing queue
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Connected Page Summary */}
          <Card className="shadow-premium border-[var(--ad-border)] bg-[var(--ad-card)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1877f2] flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md">
                    <Facebook className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ad-text-primary)] font-mono uppercase tracking-wider">
                      {settings?.facebookPageName || "Facebook Page Integration"}
                    </h3>
                    <p className="text-[11.5px] text-[var(--ad-text-muted)] mt-0.5 leading-normal">
                      {facebookConnected
                        ? `Connected to page ID: ${settings?.facebookPageId}. Auto-sharing is active.`
                        : "No Facebook business page linked. Auto-posting is currently inactive."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${facebookConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ad-text-secondary)]">
                    {facebookConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminShell>
      </div>
    </TooltipProvider>
  );
}
