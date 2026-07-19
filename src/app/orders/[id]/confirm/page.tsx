import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

export default async function OrderConfirmPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, payment: true },
  });

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-silver">Order not found.</p>
      </main>
    );
  }

  const isPaid = order.status === "PAID" || order.payment?.status === "SUCCESS";

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      {isPaid && <ClearCartOnMount />}

      <p className="font-mono text-xs uppercase tracking-wide text-signal">
        {isPaid ? "Payment confirmed" : "Awaiting confirmation"}
      </p>
      <h1 className="mt-2 text-3xl">Order {order.orderNumber}</h1>
      <p className="mt-2 text-silver">
        {isPaid
          ? "Thanks — we've received your payment and are preparing your order."
          : "We're still confirming your payment. This usually takes a few seconds — refresh in a moment if it doesn't update."}
      </p>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-4 text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span className="readout">{formatPrice(Number(item.lineTotal), "NGN")}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between text-lg">
        <span>Total</span>
        <span className="readout text-signal">{formatPrice(Number(order.total), "NGN")}</span>
      </div>

      <a href="/account/orders" className="mt-10 block text-center font-mono text-xs text-silver hover:text-signal">
        View all orders →
      </a>
    </main>
  );
}
