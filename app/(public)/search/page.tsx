import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getSearchResults } from "@/lib/news";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page = "1" } = await searchParams;
  const data = await getSearchResults(q, page);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <form className="mb-8" action="/search">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="শিরোনাম, বিষয়বস্তু বা ট্যাগ দিয়ে খুঁজুন"
                className="w-full border border-[var(--np-border)] bg-[var(--np-card)] px-4 py-3 pr-14 text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-secondary)] focus:border-[var(--np-primary)] outline-none transition-colors"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm bg-[var(--np-primary)] px-3 py-2 text-xs font-label text-white hover:opacity-90 transition-opacity uppercase tracking-wider">
                খুঁজুন
              </button>
            </div>
          </form>
          <div className="border-b border-[var(--np-border)] pb-4 mb-6">
            <h1 className="np-headline-lg text-[var(--np-text-primary)]">{q || "কীওয়ার্ড লিখুন"}</h1>
            <p className="np-timestamp mt-1">{data.total}টি ফলাফল পাওয়া গেছে</p>
          </div>
          {data.items.length > 0 ? (
            <div className="space-y-4">
              {data.items.map((post) => (
                <NewsCard key={post.id} post={post} variant="horizontal" />
              ))}
            </div>
          ) : q ? (
            <div className="rounded-sm border border-[var(--np-border)] bg-[var(--np-newsprint)] p-8 text-center">
              <p className="text-sm text-[var(--np-muted)]">&ldquo;{q}&rdquo; — কোনো ফলাফল পাওয়া যায়নি। অন্য কীওয়ার্ড চেষ্টা করুন।</p>
            </div>
          ) : null}
          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            makeHref={(nextPage) => `/search?q=${encodeURIComponent(q)}&page=${nextPage}`}
          />
        </section>

        <CommonSidebar />
      </div>
    </main>
  );
}
