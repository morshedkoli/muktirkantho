"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Upazila = {
  id: string;
  name: string;
  slug: string;
};

type District = {
  id: string;
  name: string;
  slug: string;
  upazilas: Upazila[];
};

type Division = {
  id: string;
  name: string;
  slug: string;
  districts: District[];
};

type LocationFilterProps = {
  divisions: Division[];
};

export function LocationFilter({ divisions }: LocationFilterProps) {
  const [divisionSlug, setDivisionSlug] = useState("");
  const [districtSlug, setDistrictSlug] = useState("");
  const [upazilaSlug, setUpazilaSlug] = useState("");

  const selectedDivision = useMemo(
    () => divisions.find((division) => division.slug === divisionSlug) ?? null,
    [divisionSlug, divisions]
  );

  const selectedDistrict = useMemo(
    () => selectedDivision?.districts.find((district) => district.slug === districtSlug) ?? null,
    [districtSlug, selectedDivision]
  );

  const divisionPath = selectedDivision ? `/division/${selectedDivision.slug}` : "";
  const districtPath = selectedDistrict ? `/district/${selectedDistrict.slug}` : "";
  const upazilaPath = selectedDistrict && upazilaSlug
    ? `/district/${selectedDistrict.slug}/${upazilaSlug}`
    : "";

  return (
    <div className="rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-5 shadow-[var(--np-shadow)]">
      <h3 className="font-display text-lg font-bold text-[var(--np-text-primary)]">Filter by Location</h3>
      <p className="mt-1 text-xs text-[var(--np-text-secondary)]">Browse division, district and upazila specific news.</p>

      <div className="mt-4 space-y-3">
        <select
          value={divisionSlug}
          onChange={(event) => {
            setDivisionSlug(event.target.value);
            setDistrictSlug("");
            setUpazilaSlug("");
          }}
          className="w-full rounded-md border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2.5 text-sm text-[var(--np-text-primary)] focus:border-[var(--np-primary)] focus:outline-none"
          style={{ colorScheme: "dark light" }}
        >
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.slug} className="bg-[var(--np-card)] text-[var(--np-text-primary)]">
              {division.name}
            </option>
          ))}
        </select>

        <select
          value={districtSlug}
          onChange={(event) => {
            setDistrictSlug(event.target.value);
            setUpazilaSlug("");
          }}
          disabled={!selectedDivision || selectedDivision.districts.length === 0}
          className="w-full rounded-md border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2.5 text-sm text-[var(--np-text-primary)] disabled:cursor-not-allowed disabled:opacity-60 focus:border-[var(--np-primary)] focus:outline-none"
          style={{ colorScheme: "dark light" }}
        >
          <option value="">Select District</option>
          {(selectedDivision?.districts ?? []).map((district) => (
            <option key={district.id} value={district.slug} className="bg-[var(--np-card)] text-[var(--np-text-primary)]">
              {district.name}
            </option>
          ))}
        </select>

        <select
          value={upazilaSlug}
          onChange={(event) => setUpazilaSlug(event.target.value)}
          disabled={!selectedDistrict || selectedDistrict.upazilas.length === 0}
          className="w-full rounded-md border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2.5 text-sm text-[var(--np-text-primary)] disabled:cursor-not-allowed disabled:opacity-60 focus:border-[var(--np-primary)] focus:outline-none"
          style={{ colorScheme: "dark light" }}
        >
          <option value="">Select Upazila</option>
          {(selectedDistrict?.upazilas ?? []).map((upazila) => (
            <option key={upazila.id} value={upazila.slug} className="bg-[var(--np-card)] text-[var(--np-text-primary)]">
              {upazila.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Link
            href={divisionPath || "#"}
            aria-disabled={!divisionPath}
            className="rounded-md bg-[var(--np-primary)] px-2 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[var(--np-primary-hover)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Division
          </Link>
          <Link
            href={districtPath || "#"}
            aria-disabled={!districtPath}
            className="rounded-md border border-[var(--np-border)] bg-[var(--np-background)] px-2 py-2 text-center text-xs font-semibold text-[var(--np-text-primary)] transition-colors hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            District
          </Link>
          <Link
            href={upazilaPath || "#"}
            aria-disabled={!upazilaPath}
            className="rounded-md border border-[var(--np-border)] bg-[var(--np-background)] px-2 py-2 text-center text-xs font-semibold text-[var(--np-text-primary)] transition-colors hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Upazila
          </Link>
        </div>
      </div>
    </div>
  );
}
