import { ProductCard } from "@/components/ProductCard";

// Placeholder data — replace with a db.product.findMany() query once seeded
const featured = [
  {
    slug: "phone-x-pro-256",
    name: "Phone X Pro",
    imageUrl: "/placeholder/phone.svg",
    price: 850000,
    spec: "256GB · Titanium Grey",
    condition: "NEW" as const,
  },
  {
    slug: "ultrabook-14",
    name: "UltraBook 14",
    imageUrl: "/placeholder/laptop.svg",
    price: 1450000,
    spec: "16GB RAM · 512GB SSD",
    condition: "NEW" as const,
  },
  {
    slug: "tab-air-11",
    name: "Tab Air 11",
    imageUrl: "/placeholder/tablet.svg",
    price: 420000,
    spec: "Wi-Fi · 128GB",
    condition: "REFURBISHED" as const,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-line px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="readout text-xs uppercase tracking-[0.2em] text-signal">
            in stock · shipping nationwide
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] md:text-6xl">
            Genuine devices,
            <br />
            verified before they leave the shelf.
          </h1>
          <p className="mt-6 max-w-md text-silver">
            Phones, tablets, laptops, and accessories — every unit checked and
            benchmarked before dispatch.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="/products"
              className="rounded-card bg-signal px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              Browse catalog
            </a>
            <a
              href="/track-order"
              className="rounded-card border border-line px-6 py-3 text-sm font-medium text-titanium transition-colors hover:border-signal/40"
            >
              Track an order
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl">Featured this week</h2>
            <a href="/products" className="font-mono text-xs text-silver hover:text-signal">
              view all →
            </a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.slug} {...p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
