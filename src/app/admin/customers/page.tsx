import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { total: true, status: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl">Customers</h1>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wide text-silver">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Orders</th>
            <th className="pb-3">Lifetime spend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {customers.map((c) => {
            const spend = c.orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED")
              .reduce((sum, o) => sum + Number(o.total), 0);
            return (
              <tr key={c.id}>
                <td className="py-3">{c.name}</td>
                <td className="py-3 text-silver">{c.email}</td>
                <td className="py-3 font-mono text-xs">{c.orders.length}</td>
                <td className="readout py-3 text-signal">{formatPrice(spend, "NGN")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {customers.length === 0 && <p className="mt-6 text-silver">No customers yet.</p>}
    </div>
  );
}
