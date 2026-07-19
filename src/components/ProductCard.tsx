import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  currency?: "NGN" | "USD";
  spec: string; // one headline spec, e.g. "256GB · Titanium"
  condition?: "NEW" | "REFURBISHED" | "USED";
};

export function ProductCard({
  slug,
  name,
  imageUrl,
  price,
  currency = "NGN",
  spec,
  condition = "NEW",
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group relative block overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-signal/40"
    >
      <div className="relative aspect-square overflow-hidden bg-ink">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
        {/* signature: scanline sweep on hover, evokes a device readout */}
        <div className="absolute inset-0 bg-scanline opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {condition !== "NEW" && (
          <span className="absolute left-3 top-3 rounded-full border border-signal/40 bg-ink/80 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-signal">
            {condition}
          </span>
        )}
      </div>
      <div className="border-t border-line p-4">
        <h3 className="text-sm font-medium text-titanium">{name}</h3>
        <p className="mt-1 font-mono text-xs text-silver">{spec}</p>
        <p className="readout mt-3 text-base text-signal">{formatPrice(price, currency)}</p>
      </div>
    </Link>
  );
}
