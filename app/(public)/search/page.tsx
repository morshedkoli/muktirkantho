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
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <section>
          <form className="mb-8" action="/search">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search news by title, excerpt, content or tag"
              className="w-full rounded-lg border border-[var(--np-border)] bg-[var(--np-card)] px-4 py-3 text-[var(--np-text-primary)]"
            />
          </form>
          <h1 className="font-display text-2xl font-bold text-[var(--np-text-primary)]">Search: {q || "Type a keyword"}</h1>
          <p className="mt-2 text-sm text-[var(--np-text-secondary)]">{data.total} results found.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
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
