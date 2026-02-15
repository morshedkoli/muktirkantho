import { AdminShell } from "@/components/admin/admin-shell";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import {
    createDivisionAction,
    deleteDivisionAction,
} from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";

const initialState = { status: "idle" as const };

export default async function AdminDivisionsPage() {
    const divisions = await prisma.division.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { districts: true } } }
    });

    // Map to match the expected Item type (using mapped count to posts property for display consistently)
    const items = divisions.map(d => ({
        ...d,
        _count: { posts: d._count.districts } // Reusing the posts count display for districts count
    }));

    return (
        <AdminShell title="Divisions">
            <TaxonomyManager
                title="Division"
                items={items}
                createAction={createDivisionAction}
                deleteAction={deleteDivisionAction}
                initialState={initialState}
                disableActions={true}
            />
        </AdminShell>
    );
}
