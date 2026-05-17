import { AdminShell } from "@/components/admin/admin-shell";
import { Hash, Plus, Search, Edit2, Trash2, TrendingUp } from "lucide-react";

const tags = [
  { name: "Politics", count: 342, trend: "+12%" },
  { name: "Sports", count: 198, trend: "+5%" },
  { name: "Economy", count: 167, trend: "+8%" },
  { name: "Education", count: 145, trend: "+3%" },
  { name: "Health", count: 134, trend: "+15%" },
  { name: "Technology", count: 98, trend: "+22%" },
  { name: "Environment", count: 87, trend: "+7%" },
  { name: "Culture", count: 76, trend: "+1%" },
  { name: "International", count: 65, trend: "+10%" },
  { name: "Crime", count: 54, trend: "-2%" },
  { name: "Agriculture", count: 43, trend: "+4%" },
  { name: "Weather", count: 38, trend: "+18%" },
];

export default function TagsPage() {
  return (
    <AdminShell
      title="Tags"
      description="Manage article tags, merge duplicates, and analyse tag usage"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-ink)]/80 transition-all font-editorial-mono tracking-wider uppercase">
          <Plus className="h-4 w-4" />
          Add Tag
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
          <input type="text" placeholder="Search tags..." className="w-full border border-[var(--ad-border)] bg-[var(--ad-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)]" />
        </div>
        <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] tracking-wider">{tags.length} tags total</span>
      </div>

      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ad-paper)] border-b border-[var(--ad-border)]">
              <tr>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Tag</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Articles</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Trend</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ad-border)]">
              {tags.map((tag) => (
                <tr key={tag.name} className="hover:bg-[var(--ad-paper)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                      <span className="font-medium text-[var(--ad-text-primary)]">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-editorial-display text-lg font-black text-[var(--ad-text-primary)]">{tag.count}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className={`flex items-center gap-1 font-editorial-mono text-[10px] tracking-wider ${
                      tag.trend.startsWith("+") ? "text-[var(--ad-success)]" : "text-[var(--ad-breaking)]"
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {tag.trend}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] rounded transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
