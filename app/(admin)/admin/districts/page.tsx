import { AdminShell } from "@/components/admin/admin-shell";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import {
  createDistrictAction,
  deleteDistrictAction,
} from "@/app/(admin)/admin/actions";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

export default async function AdminDistrictsPage() {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    include: { division: true } // Include division for display
  });
  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });

  return (
    <AdminShell title="Districts">
      <TaxonomyManager
        title="District"
        items={districts}
        divisions={divisions}
        createAction={createDistrictAction}
        deleteAction={deleteDistrictAction}
        initialState={initialState}
        disableActions={true}
      />
    </AdminShell>
  );
}
