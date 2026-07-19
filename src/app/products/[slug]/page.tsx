import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";

type Props = { params: { slug: string } };

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      brand: true,
      category: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.description,
    openGraph: { images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  // JSON-LD structured data for rich results in search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: Number(product.variants[0]?.price ?? product.basePrice),
      availability:
        (product.variants[0]?.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-8 font-mono text-xs text-silver">
        <a href="/products" className="hover:text-signal">Shop</a>
        {" / "}
        <a href={`/products?category=${product.category.slug}`} className="hover:text-signal">
          {product.category.name}
        </a>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-panel">
            <Image
              src={product.images[0]?.url || "/placeholder/device.svg"}
              alt={product.name}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-card border border-line bg-panel">
                  <Image src={img.url} alt={product.name} fill className="object-contain p-3" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="font-mono text-xs uppercase tracking-wide text-silver">{product.brand.name}</p>
          )}
          <h1 className="mt-1 text-3xl">{product.name}</h1>

          {avgRating && (
            <p className="mt-2 font-mono text-xs text-silver">
              {avgRating.toFixed(1)} · {product.reviews.length} review{product.reviews.length !== 1 && "s"}
            </p>
          )}

          {product.condition !== "NEW" && (
            <span className="mt-3 inline-block rounded-full border border-signal/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-signal">
              {product.condition}
            </span>
          )}

          <p className="mt-6 text-sm leading-relaxed text-silver">{product.description}</p>

          <div className="mt-8 border-t border-line pt-8">
            <ProductVariantSelector
              productId={product.id}
              basePrice={Number(product.basePrice)}
              currency={product.currency as "NGN" | "USD"}
              variants={product.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                attributes: v.attributes as Record<string, string>,
                price: Number(v.price),
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="text-xl">Reviews</h2>
          <div className="mt-6 space-y-6">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-6">
                <p className="readout text-sm text-signal">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                <p className="mt-2 text-sm text-titanium">{r.comment}</p>
                <p className="mt-1 font-mono text-xs text-silver">{r.user.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
