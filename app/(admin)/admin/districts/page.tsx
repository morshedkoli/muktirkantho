import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import { Button } from "@/components/ui/button";
import {
  createDistrictAction,
  deleteDistrictAction,
} from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

const initialState = { status: "idle" as const };

export default async function AdminDistrictsPage() {
  const [districts, divisions, upazilas] = await Promise.all([
    prisma.district.findMany({ orderBy: { name: "asc" }, include: { division: true } }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.upazila.findMany({ orderBy: { name: "asc" } }),
  ]);

  const upazilasByDistrict = new Map<string, number>();
  for (const upazila of upazilas) {
    upazilasByDistrict.set(
      upazila.districtId,
      (upazilasByDistrict.get(upazila.districtId) ?? 0) + 1
    );
  }

  return (
    <AdminShell
      kicker="অঞ্চল"
      title="জেলা"
      description="বিভাগ অনুযায়ী সাজানো জেলার তালিকা।"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/divisions">
              <ArrowLeft className="h-4 w-4" />
              বিভাগ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/upazilas">
              উপজেলা
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <LocationManager
        type="district"
        items={districts.map((district) => ({
          id: district.id,
          name: district.name,
          slug: district.slug,
          parentId: district.divisionId ?? undefined,
          parentName: district.division?.name,
          count: upazilasByDistrict.get(district.id) ?? 0,
          countLabel: "upazilas",
        }))}
        parents={divisions.map((division) => ({ id: division.id, name: division.name }))}
        parentLabel="বিভাগ"
        createAction={createDistrictAction}
        deleteAction={deleteDistrictAction}
        initialState={initialState}
        stats={[
          { label: "মোট জেলা", value: districts.length },
          { label: "মোট উপজেলা", value: upazilas.length },
          {
            label: "গড় উপজেলা/জেলা",
            value:
              districts.length > 0 ? Math.round(upazilas.length / districts.length) : 0,
          },
        ]}
      />
    </AdminShell>
  );
}
