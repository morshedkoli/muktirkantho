import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import {
  createDistrictAction,
  deleteDistrictAction,
} from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";

const initialState = { status: "idle" as const };

export default async function AdminDistrictsPage() {
  const [districts, divisions, upazilas] = await Promise.all([
    prisma.district.findMany({
      orderBy: { name: "asc" },
      include: { division: true }
    }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.upazila.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalUpazilas = upazilas.length;
  const upazilasByDistrict = new Map<string, number>();
  for (const u of upazilas) {
    upazilasByDistrict.set(u.districtId, (upazilasByDistrict.get(u.districtId) || 0) + 1);
  }

  return (
    <AdminShell
      title="Districts"
      description="Manage districts across all divisions"
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/admin/divisions"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all"
          >
            ← Divisions
          </a>
          <a
            href="/admin/upazilas"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all"
          >
            Manage Upazilas →
          </a>
        </div>
      }
    >
      <LocationManager
        type="district"
        items={districts.map(d => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          parentId: d.divisionId || undefined,
          parentName: d.division?.name,
          count: upazilasByDistrict.get(d.id) || 0,
          countLabel: "upazilas",
        }))}
        parents={divisions.map(d => ({ id: d.id, name: d.name }))}
        parentLabel="Division"
        createAction={createDistrictAction}
        deleteAction={deleteDistrictAction}
        initialState={initialState}
        stats={[
          { label: "Total Districts", value: districts.length },
          { label: "Total Upazilas", value: totalUpazilas },
          { label: "Avg Upazilas/District", value: districts.length > 0 ? Math.round(totalUpazilas / districts.length) : 0 },
        ]}
      />
    </AdminShell>
  );
}
