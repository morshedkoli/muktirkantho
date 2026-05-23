import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getPublishedByCategory as _getPublishedByCategory } from "@/lib/news";
import { toInt } from "@/lib/utils";

const getPublishedByCategory = cache(_getPublishedByCategory);

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedByCategory(slug, 1);
  if (!data) return {};
  return {
    title: `${data.category.name} — সর্বশেষ সংবাদ`,
    description: `${data.category.name} বিভাগের সর্বশেষ সংবাদ পড়ুন মুক্তির কণ্ঠে।`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;

  const data = await getPublishedByCategory(slug, toInt(page, 1));
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      {/* Two-column: posts (flex-1) | sidebar (300px) */}
      <div className="flex gap-8">
        {/* ── MAIN CONTENT ── */}
        <section className="flex-1 min-w-0">
          {/* Category header */}
          <div className="mb-6 border-b border-[var(--np-border)] pb-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="np-headline-lg text-[var(--np-text-primary)]">
                {data.category.name}
              </h1>
              <span className="text-sm text-[var(--np-muted)]">
                {data.total} টি সংবাদ
              </span>
            </div>
            <div className="mt-2 h-1 w-12 bg-[var(--np-primary)]" />
          </div>

          {/* Posts grid — 2 columns */}
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            makeHref={(nextPage) => `/category/${slug}?page=${nextPage}`}
          />
        </section>

        {/* ── SIDEBAR ── */}
        <CommonSidebar />
      </div>
    </main>
  );
}
