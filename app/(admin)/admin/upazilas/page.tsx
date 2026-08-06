import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import { Button } from "@/components/ui/button";
import { createUpazilaAction, deleteUpazilaAction } from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

const initialState = { status: "idle" as const };

export default async function AdminUpazilasPage() {
  const [upazilas, districts] = await Promise.all([
    prisma.upazila.findMany({ include: { district: true }, orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
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
      title="উপজেলা"
      description="জেলা অনুযায়ী সাজানো উপজেলার তালিকা।"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/districts">
            <ArrowLeft className="h-4 w-4" />
            জেলা
          </Link>
        </Button>
      }
    >
      <LocationManager
        type="upazila"
        items={upazilas.map((upazila) => ({
          id: upazila.id,
          name: upazila.name,
          slug: upazila.slug,
          parentId: upazila.districtId,
          parentName: upazila.district.name,
        }))}
        parents={districts.map((district) => ({
          id: district.id,
          name: district.name,
          count: upazilasByDistrict.get(district.id) ?? 0,
        }))}
        parentLabel="জেলা"
        createAction={createUpazilaAction}
        deleteAction={deleteUpazilaAction}
        initialState={initialState}
        stats={[
          { label: "মোট উপজেলা", value: upazilas.length },
          { label: "মোট জেলা", value: districts.length },
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
