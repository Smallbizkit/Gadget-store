"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";

type PaymentInit =
  | { provider: "PAYSTACK"; redirectUrl: string; orderId: string }
  | { provider: "STRIPE"; clientSecret: string; orderId: string };

export default function CheckoutPage() {
  const { items } = useCartStore();
  const [provider, setProvider] = useState<"PAYSTACK" | "STRIPE">("PAYSTACK");
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Save the address, 2. create the order + payment intent
    const addressRes = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    });
    if (!addressRes.ok) {
      setError("Could not save delivery address");
      setLoading(false);
      return;
    }
    const { id: addressId } = await addressRes.json();

    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId,
        provider,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      }),
    });

    if (!orderRes.ok) {
      const data = await orderRes.json();
      setError(data.error || "Could not place order");
      setLoading(false);
      return;
    }

    const data = await orderRes.json();
    setLoading(false);

    if (provider === "PAYSTACK") {
      window.location.href = data.redirectUrl;
    } else {
      setPaymentInit({ provider: "STRIPE", clientSecret: data.clientSecret, orderId: data.orderId });
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-silver">Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl">Checkout</h1>

      <div className="mt-6 rounded-card border border-line bg-panel p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-silver">{items.length} item(s)</p>
          <p className="readout text-signal">{formatPrice(subtotal, items[0]?.currency ?? "NGN")}</p>
        </div>
      </div>

      {paymentInit?.provider === "STRIPE" ? (
        <StripeCheckoutForm clientSecret={paymentInit.clientSecret} orderId={paymentInit.orderId} />
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            placeholder="Delivery address"
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            required
            className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
          />
          <div className="flex gap-3">
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
              className="w-full rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
            />
            <input
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              required
              className="w-full rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
            />
          </div>
          <input
            placeholder="Phone number"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            required
            className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
          />

          <div className="mt-2">
            <p className="font-mono text-xs uppercase tracking-wide text-silver">Payment method</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setProvider("PAYSTACK")}
                className={`flex-1 rounded-card border px-4 py-3 text-sm ${
                  provider === "PAYSTACK" ? "border-signal text-signal" : "border-line text-titanium"
                }`}
              >
                Paystack (NGN)
              </button>
              <button
                type="button"
                onClick={() => setProvider("STRIPE")}
                className={`flex-1 rounded-card border px-4 py-3 text-sm ${
                  provider === "STRIPE" ? "border-signal text-signal" : "border-line text-titanium"
                }`}
              >
                Card (USD via Stripe)
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-card bg-signal py-3 text-sm font-medium text-ink disabled:opacity-60"
          >
            {loading ? "Placing order…" : "Continue to payment"}
          </button>
        </form>
      )}
    </main>
  );
}
