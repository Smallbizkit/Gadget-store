"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type ProductFiltersProps = {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
};

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset pagination on any filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const activeCondition = searchParams.get("condition");

  return (
    <aside className="w-full shrink-0 md:w-56">
      <div className="mb-8">
        <h3 className="font-mono text-xs uppercase tracking-wide text-silver">Category</h3>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={`text-sm ${!activeCategory ? "text-signal" : "text-titanium hover:text-signal"}`}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => updateParam("category", c.slug)}
                className={`text-sm ${activeCategory === c.slug ? "text-signal" : "text-titanium hover:text-signal"}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-xs uppercase tracking-wide text-silver">Brand</h3>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateParam("brand", null)}
              className={`text-sm ${!activeBrand ? "text-signal" : "text-titanium hover:text-signal"}`}
            >
              All
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.slug}>
              <button
                onClick={() => updateParam("brand", b.slug)}
                className={`text-sm ${activeBrand === b.slug ? "text-signal" : "text-titanium hover:text-signal"}`}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-xs uppercase tracking-wide text-silver">Condition</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {["NEW", "REFURBISHED", "USED"].map((cond) => (
            <li key={cond}>
              <button
                onClick={() => updateParam("condition", activeCondition === cond ? null : cond)}
                className={`text-sm ${activeCondition === cond ? "text-signal" : "text-titanium hover:text-signal"}`}
              >
                {cond.charAt(0) + cond.slice(1).toLowerCase()}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-wide text-silver">Price range</h3>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") || ""}
            onBlur={(e) => updateParam("minPrice", e.target.value || null)}
            className="w-full rounded-card border border-line bg-panel px-2 py-1.5 text-xs outline-none focus-visible:border-signal"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") || ""}
            onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
            className="w-full rounded-card border border-line bg-panel px-2 py-1.5 text-xs outline-none focus-visible:border-signal"
          />
        </div>
      </div>
    </aside>
  );
}
