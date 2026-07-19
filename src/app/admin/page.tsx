import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [revenueAgg, orderCount, customerCount, variants, recentOrders] = await Promise.all([
    db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.productVariant.findMany({ include: { product: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
  ]);

  const lowStock = variants.filter((v) => v.stock <= v.lowStockAt).slice(0, 5);

  const stats = [
    { label: "Revenue (paid orders)", value: formatPrice(Number(revenueAgg._sum.total ?? 0), "NGN") },
    { label: "Total orders", value: String(orderCount) },
    { label: "Customers", value: String(customerCount) },
  ];

  return (
    <div>
      <h1 className="text-2xl">Overview</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-line bg-panel p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-silver">{s.label}</p>
            <p className="readout mt-2 text-2xl text-signal">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg">Recent orders</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {recentOrders.map((o) => (
              <a
                key={o.id}
                href={`/admin/orders?highlight=${o.id}`}
                className="flex items-center justify-between py-3 text-sm hover:text-signal"
              >
                <span>
                  {o.orderNumber} · {o.user.name}
                </span>
                <span className="font-mono text-xs text-silver">{o.status}</span>
              </a>
            ))}
            {recentOrders.length === 0 && <p className="py-4 text-sm text-silver">No orders yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg">Low stock</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {lowStock.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                <span>{v.product.name} ({v.sku})</span>
                <span className="font-mono text-xs text-signal">{v.stock} left</span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="py-4 text-sm text-silver">Nothing low on stock.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
