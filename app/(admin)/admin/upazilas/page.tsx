import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import { createUpazilaAction, deleteUpazilaAction } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";

const initialState = { status: "idle" as const };

export default async function AdminUpazilasPage() {
  const [upazilas, districts] = await Promise.all([
    prisma.upazila.findMany({
      include: { district: true },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  const upazilasByDistrict = new Map<string, number>();
  for (const u of upazilas) {
    upazilasByDistrict.set(u.districtId, (upazilasByDistrict.get(u.districtId) || 0) + 1);
  }

  return (
    <AdminShell
      title="Upazilas"
      description="Manage upazilas organized by their parent district"
      actions={
        <a
          href="/admin/districts"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all"
        >
          ← Districts
        </a>
      }
    >
      <LocationManager
        type="upazila"
        items={upazilas.map(u => ({
          id: u.id,
          name: u.name,
          slug: u.slug,
          parentId: u.districtId,
          parentName: u.district.name,
        }))}
        parents={districts.map(d => ({ id: d.id, name: d.name, count: upazilasByDistrict.get(d.id) || 0 }))}
        parentLabel="District"
        createAction={createUpazilaAction}
        deleteAction={deleteUpazilaAction}
        initialState={initialState}
        stats={[
          { label: "Total Upazilas", value: upazilas.length },
          { label: "Total Districts", value: districts.length },
          { label: "Avg Upazilas/District", value: districts.length > 0 ? Math.round(upazilas.length / districts.length) : 0 },
        ]}
      />
    </AdminShell>
  );
}
