"use client";

import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/payments/stripe-client";

function InnerForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}/confirm`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full rounded-card bg-signal py-3 text-sm font-medium text-ink disabled:opacity-60"
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}

export function StripeCheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#39D9C7" } } }}
    >
      <InnerForm orderId={orderId} />
    </Elements>
  );
}
