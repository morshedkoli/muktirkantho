import { AdminShell } from "@/components/admin/admin-shell";
import { createUpazilaAction, deleteUpazilaAction } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";
import { UpazilaManager } from "@/components/admin/upazila-manager";

const initialState = { status: "idle" as const };

export default async function AdminUpazilasPage() {
  const [upazilas, districts] = await Promise.all([
    prisma.upazila.findMany({
      include: { district: true },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Group upazilas by district
  const upazilasByDistrict = districts.map((district) => ({
    ...district,
    upazilas: upazilas.filter((u) => u.districtId === district.id),
  }));

  return (
    <AdminShell 
      title="Upazilas" 
      description="Manage upazilas grouped by districts"
    >
      <UpazilaManager
        districts={districts}
        upazilasByDistrict={upazilasByDistrict}
        createAction={createUpazilaAction}
        deleteAction={deleteUpazilaAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
