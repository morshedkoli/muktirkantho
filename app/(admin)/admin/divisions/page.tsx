import { AdminShell } from "@/components/admin/admin-shell";
import { LocationManager } from "@/components/admin/location-manager";
import {
    createDivisionAction,
    deleteDivisionAction,
} from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";

const initialState = { status: "idle" as const };

export default async function AdminDivisionsPage() {
    const [divisions, districts] = await Promise.all([
        prisma.division.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { districts: true } } }
        }),
        prisma.district.findMany({
            orderBy: { name: "asc" },
            include: { division: true }
        }),
    ]);

    const totalDistricts = districts.length;
    const districtsByDivision = divisions.map(d => ({
        ...d,
        districtCount: d._count.districts,
        districts: districts.filter(ds => ds.divisionId === d.id)
    }));

    return (
        <AdminShell
            title="Divisions"
            description="Manage Bangladesh's administrative divisions and their districts"
            actions={
                <a
                    href="/admin/districts"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all"
                >
                    Manage Districts →
                </a>
            }
        >
            <LocationManager
                type="division"
                items={divisions.map(d => ({
                    id: d.id,
                    name: d.name,
                    slug: d.slug,
                    count: d._count.districts,
                    countLabel: "districts",
                    children: districts.filter(ds => ds.divisionId === d.id).map(ds => ({
                        id: ds.id,
                        name: ds.name,
                        slug: ds.slug,
                    })),
                }))}
                createAction={createDivisionAction}
                deleteAction={deleteDivisionAction}
                initialState={initialState}
                stats={[
                    { label: "Total Divisions", value: divisions.length },
                    { label: "Total Districts", value: totalDistricts },
                    { label: "Avg Districts/Division", value: divisions.length > 0 ? Math.round(totalDistricts / divisions.length) : 0 },
                ]}
            />
        </AdminShell>
    );
}
