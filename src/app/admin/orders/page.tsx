import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, payment: true },
  });

  return (
    <div>
      <h1 className="text-2xl">Orders</h1>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wide text-silver">
            <th className="pb-3">Order</th>
            <th className="pb-3">Customer</th>
            <th className="pb-3">Total</th>
            <th className="pb-3">Payment</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="py-3 font-mono text-xs">{o.orderNumber}</td>
              <td className="py-3">
                {o.user.name}
                <span className="block text-xs text-silver">{o.user.email}</span>
              </td>
              <td className="readout py-3 text-signal">{formatPrice(Number(o.total), "NGN")}</td>
              <td className="py-3 font-mono text-xs text-silver">
                {o.payment ? `${o.payment.provider} · ${o.payment.status}` : "—"}
              </td>
              <td className="py-3">
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-6 text-silver">No orders yet.</p>}
    </div>
  );
}
