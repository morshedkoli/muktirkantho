import type { Metadata } from "next";
import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getLatestNews } from "@/lib/news";
import { toInt } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Latest News",
  description: "Latest published news updates from Muktir Kantho.",
  alternates: { canonical: "/news" },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function LatestNewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getLatestNews(toInt(page, 1), 12);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-6 border-b border-[var(--np-border)] pb-3">
            <h1 className="np-headline-lg text-[var(--np-text-primary)]">সর্বশেষ সংবাদ</h1>
            <p className="mt-2 text-sm text-[var(--np-text-secondary)]">{data.total}টি সংবাদ প্রকাশিত</p>
          </div>

          {data.items.length === 0 ? (
            <div className="rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-8 text-center text-[var(--np-text-secondary)]">
              কোনো সংবাদ পাওয়া যায়নি।
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                currentPage={data.page}
                totalPages={data.pages}
                makeHref={(nextPage) => `/news?page=${nextPage}`}
              />
            </>
          )}
        </section>

        <CommonSidebar />
      </div>
    </main>
  );
}
