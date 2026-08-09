import { notFound } from "next/navigation";
import { NewsCard } from "@/components/public/news-card";
import { PageHeading } from "@/components/public/section-heading";
import { EmptyState } from "@/components/public/empty-state";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getPublishedByDistrict } from "@/lib/news";
import { toInt } from "@/lib/utils";
import { decodePathSegment } from "@/lib/url-segment";

export const revalidate = 60;

type Props = {
  params: Promise<{ district: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function DistrictPage({ params, searchParams }: Props) {
  const { district: rawDistrict } = await params;
  const { page } = await searchParams;
  // Latin today, but a district added from the admin takes its slug from a
  // Bangla name — decoded here so that one does not 404 the day it is created.
  const district = decodePathSegment(rawDistrict);
  const data = await getPublishedByDistrict(district, toInt(page, 1));
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <PageHeading title={data.district.name} count={data.total} />
          {data.items.length === 0 ? (
            <EmptyState message="এই জেলায় এখনো কোনো সংবাদ প্রকাশিত হয়নি।" />
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
            makeHref={(nextPage) => `/district/${district}?page=${nextPage}`}
          />
        </section>

        <CommonSidebar />
      </div>
    </main>
  );
}
