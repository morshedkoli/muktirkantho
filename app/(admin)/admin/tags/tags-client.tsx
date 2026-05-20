"use client";

import { useState } from "react";
import { Hash, Search } from "lucide-react";
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

type TagItem = {
  name: string;
  count: number;
  trend: string;
};

type TagsClientProps = {
  initialTags: TagItem[];
};

export function TagsClient({ initialTags }: TagsClientProps) {
  const [search, setSearch] = useState("");

  const filteredTags = initialTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters & Action Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-muted)] pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tags..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="font-mono text-[10px] text-[var(--ad-text-muted)] font-bold uppercase tracking-wider">
          {filteredTags.length} of {initialTags.length} tags total
        </span>
      </div>

      {/* Tags Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[60%]">Tag</TableHead>
                <TableHead className="w-[40%]">Articles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="px-6 py-12 text-center text-sm text-[var(--ad-text-muted)]">
                    No tags found. Tags are automatically created when you add them to news posts.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((tag) => (
                  <TableRow key={tag.name} className="group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-[var(--ad-text-muted)]" />
                        <span className="font-bold text-[var(--ad-text-primary)]">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-bold text-[var(--ad-text-primary)]">
                        {tag.count}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
