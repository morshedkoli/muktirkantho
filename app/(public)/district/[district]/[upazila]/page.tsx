import { notFound } from "next/navigation";
import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { getPublishedByUpazila } from "@/lib/news";
import { toInt } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ district: string; upazila: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function UpazilaPage({ params, searchParams }: Props) {
  const { district, upazila } = await params;
  const { page } = await searchParams;
  const data = await getPublishedByUpazila(district, upazila, toInt(page, 1));
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <section>
          <h1 className="font-display text-3xl font-black text-[var(--np-text-primary)]">
            {data.upazila.name}, {data.district.name}
          </h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            makeHref={(nextPage) => `/district/${district}/${upazila}?page=${nextPage}`}
          />
        </section>

        <CommonSidebar />
      </div>
    </main>
  );
}
