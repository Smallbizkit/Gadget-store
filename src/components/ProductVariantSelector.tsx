"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
};

type Props = {
  productId: string;
  basePrice: number;
  currency: "NGN" | "USD";
  variants: Variant[];
};

export function ProductVariantSelector({ productId, basePrice, currency, variants }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId);
  const price = selected?.price ?? basePrice;
  const stock = selected?.stock ?? 0;

  // Group attribute keys, e.g. { storage: ["128GB","256GB"], color: [...] }
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => Object.keys(v.attributes).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [variants]);

  function handleAddToCart() {
    if (!selected) return;
    addItem({
      productId,
      variantId: selected.id,
      name: Object.values(selected.attributes).join(" · "),
      sku: selected.sku,
      attributes: selected.attributes,
      price,
      currency,
      quantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div>
      <p className="readout text-2xl text-signal">{formatPrice(price, currency)}</p>

      {attributeKeys.map((key) => (
        <div key={key} className="mt-5">
          <p className="font-mono text-xs uppercase tracking-wide text-silver">{key}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(new Set(variants.map((v) => v.attributes[key]).filter(Boolean))).map((value) => {
              const matchingVariant = variants.find(
                (v) =>
                  v.attributes[key] === value &&
                  attributeKeys
                    .filter((k) => k !== key)
                    .every((k) => v.attributes[k] === selected?.attributes[k])
              );
              const isActive = selected?.attributes[key] === value;
              return (
                <button
                  key={value}
                  disabled={!matchingVariant}
                  onClick={() => matchingVariant && setSelectedId(matchingVariant.id)}
                  className={`rounded-card border px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "border-signal text-signal"
                      : "border-line text-titanium hover:border-signal/40 disabled:opacity-30"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-5 font-mono text-xs text-silver">
        {stock > 0 ? `${stock} in stock` : "Out of stock"}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center rounded-card border border-line">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-titanium hover:text-signal"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            className="px-3 py-2 text-titanium hover:text-signal"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="flex-1 rounded-card bg-signal py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {justAdded ? "Added ✓" : stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
