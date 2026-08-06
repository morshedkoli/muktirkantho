import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import { Button } from "@/components/ui/button";
import {
  createDivisionAction,
  deleteDivisionAction,
} from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

const initialState = { status: "idle" as const };

export default async function AdminDivisionsPage() {
  const [divisions, districts] = await Promise.all([
    prisma.division.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { districts: true } } },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminShell
      kicker="অঞ্চল"
      title="বিভাগ"
      description="বাংলাদেশের প্রশাসনিক বিভাগ ও তাদের অধীন জেলা।"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/districts">
            জেলা ব্যবস্থাপনা
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <LocationManager
        type="division"
        items={divisions.map((division) => ({
          id: division.id,
          name: division.name,
          slug: division.slug,
          count: division._count.districts,
          countLabel: "districts",
          children: districts
            .filter((d) => d.divisionId === division.id)
            .map((d) => ({ id: d.id, name: d.name, slug: d.slug })),
        }))}
        createAction={createDivisionAction}
        deleteAction={deleteDivisionAction}
        initialState={initialState}
        stats={[
          { label: "মোট বিভাগ", value: divisions.length },
          { label: "মোট জেলা", value: districts.length },
          {
            label: "গড় জেলা/বিভাগ",
            value:
              divisions.length > 0 ? Math.round(districts.length / divisions.length) : 0,
          },
        ]}
      />
    </AdminShell>
  );
}
