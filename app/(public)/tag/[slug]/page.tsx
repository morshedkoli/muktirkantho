import { NewsCard } from "@/components/public/news-card";
import { PageHeading } from "@/components/public/section-heading";
import { EmptyState } from "@/components/public/empty-state";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getPublishedByTag } from "@/lib/news";
import { toInt } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

/**
 * Tags are stored as free text (`পদ্মা সেতু`), not slugs, so they arrive
 * percent-encoded in the path. Without decoding, the DB lookup compares against
 * `%E0%A6%AA…` and every multi-byte or spaced tag returns nothing — and the
 * heading rendered the raw escape sequence.
 */
function decodeTag(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const tag = decodeTag(slug);
  const data = await getPublishedByTag(tag, toInt(page, 1));

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <PageHeading title={`#${data.tag}`} count={data.total} />
          {data.items.length === 0 ? (
            <EmptyState message="এই ট্যাগে এখনো কোনো সংবাদ নেই।" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            makeHref={(nextPage) => `/tag/${encodeURIComponent(tag)}?page=${nextPage}`}
          />
        </section>

        <CommonSidebar />
      </div>
    </main>
  );
}
