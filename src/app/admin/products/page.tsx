import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Products</h1>
        <a href="/admin/products/new" className="rounded-card bg-signal px-4 py-2 text-sm font-medium text-ink">
          + New product
        </a>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wide text-silver">
            <th className="pb-3">Name</th>
            <th className="pb-3">Category</th>
            <th className="pb-3">Price</th>
            <th className="pb-3">Stock</th>
            <th className="pb-3">Status</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => {
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            return (
              <tr key={p.id}>
                <td className="py-3">{p.name}</td>
                <td className="py-3 text-silver">{p.category.name}</td>
                <td className="readout py-3 text-signal">{formatPrice(Number(p.basePrice), p.currency as "NGN" | "USD")}</td>
                <td className="py-3 font-mono text-xs">{totalStock}</td>
                <td className="py-3 font-mono text-xs text-silver">{p.isPublished ? "Published" : "Draft"}</td>
                <td className="py-3 text-right">
                  <a href={`/admin/products/${p.id}/edit`} className="text-signal hover:underline">
                    Edit
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && <p className="mt-6 text-silver">No products yet.</p>}
    </div>
  );
}
