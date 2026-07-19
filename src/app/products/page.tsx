import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const metadata = {
  title: "Shop all products",
  description: "Browse phones, tablets, laptops, and accessories.",
};

const PAGE_SIZE = 24;

type SearchParams = {
  category?: string;
  brand?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: string;
};

async function getProducts(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(searchParams.category && { category: { slug: searchParams.category } }),
    ...(searchParams.brand && { brand: { slug: searchParams.brand } }),
    ...(searchParams.condition && { condition: searchParams.condition as never }),
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: "insensitive" } },
        { description: { contains: searchParams.q, mode: "insensitive" } },
      ],
    }),
    ...((searchParams.minPrice || searchParams.maxPrice) && {
      basePrice: {
        ...(searchParams.minPrice && { gte: Number(searchParams.minPrice) }),
        ...(searchParams.maxPrice && { lte: Number(searchParams.maxPrice) }),
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    searchParams.sort === "price_asc"
      ? { basePrice: "asc" }
      : searchParams.sort === "price_desc"
      ? { basePrice: "desc" }
      : { createdAt: "desc" };

  const [products, total, categories, brands] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { take: 1, orderBy: { position: "asc" } }, variants: { take: 1 } },
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { products, total, categories, brands, page };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, total, categories, brands, page } = await getProducts(searchParams);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl">Shop all</h1>
          <p className="mt-1 font-mono text-xs text-silver">{total} items</p>
        </div>
        <form className="hidden md:block">
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search products…"
            className="w-64 rounded-card border border-line bg-panel px-4 py-2 text-sm outline-none focus-visible:border-signal"
          />
        </form>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <Suspense fallback={null}>
          <ProductFilters
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
          />
        </Suspense>

        <div className="flex-1">
          {products.length === 0 ? (
            <p className="py-24 text-center text-silver">
              No products match those filters yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  imageUrl={p.images[0]?.url || "/placeholder/device.svg"}
                  price={Number(p.variants[0]?.price ?? p.basePrice)}
                  currency={p.currency as "NGN" | "USD"}
                  spec={p.condition === "NEW" ? "In stock" : p.condition}
                  condition={p.condition}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2 font-mono text-xs">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(p) } as never).toString()}`}
                  className={`rounded-card px-3 py-1.5 ${
                    p === page ? "bg-signal text-ink" : "border border-line text-silver hover:border-signal/40"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
