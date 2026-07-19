"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? "NGN";

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-silver">Nothing here yet.</p>
        <Link href="/products" className="mt-6 inline-block rounded-card bg-signal px-6 py-3 text-sm font-medium text-ink">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl">Your cart</h1>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4 py-5">
            <div className="flex-1">
              <p className="text-sm font-medium text-titanium">{item.name}</p>
              <p className="font-mono text-xs text-silver">{item.sku}</p>
              <p className="readout mt-1 text-sm text-signal">{formatPrice(item.price, item.currency)}</p>
            </div>

            <div className="flex items-center rounded-card border border-line">
              <button
                onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                className="px-3 py-2 text-titanium hover:text-signal"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="px-3 py-2 text-titanium hover:text-signal"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.variantId)}
              className="font-mono text-xs text-silver hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-silver">Subtotal</p>
        <p className="readout text-xl text-signal">{formatPrice(subtotal, currency)}</p>
      </div>
      <p className="mt-1 text-right font-mono text-xs text-silver">
        Shipping and any discounts are calculated at checkout.
      </p>

      <Link
        href="/checkout"
        className="mt-8 block rounded-card bg-signal py-3 text-center text-sm font-medium text-ink hover:opacity-90"
      >
        Proceed to checkout
      </Link>
    </main>
  );
}
